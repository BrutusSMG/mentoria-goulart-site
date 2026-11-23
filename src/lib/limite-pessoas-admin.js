// E7.3: contador compartilhado entre instancias; somente apos autenticacao ADMIN.
// Usa o relogio do PostgreSQL para evitar divergencias entre runners serverless.
const REGRAS = Object.freeze({
  GET: { maximo: 30, segundos: 60 },
  POST: { maximo: 10, segundos: 60 },
});

export class ErroLimitePessoasAdmin extends Error {
  constructor(codigo, status, retryAfter = null) {
    super(codigo);
    this.codigo = codigo;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function verificarLimitePessoasAdmin({ prisma, usuarioId, operacao }) {
  const regra = REGRAS[operacao];
  if (!regra || typeof usuarioId !== "string" ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(usuarioId)) {
    throw new ErroLimitePessoasAdmin("ACESSO_NEGADO", 403);
  }
  const chave = `${operacao}:${usuarioId}`;
  // INSERT ... ON CONFLICT realiza incremento atomico em uma unica linha.
  // A janela e o Retry-After usam o horario do proprio banco.
  let resultado;
  try {
    resultado = await prisma.$queryRaw`
      INSERT INTO "LimitePessoasAdmin" ("chave", "janelaInicio", "contador")
      VALUES (${chave}, clock_timestamp(), 1)
      ON CONFLICT ("chave") DO UPDATE
      SET "contador" = CASE
            WHEN "LimitePessoasAdmin"."janelaInicio"
              <= clock_timestamp() - (${regra.segundos}::int * INTERVAL '1 second')
            THEN 1 ELSE "LimitePessoasAdmin"."contador" + 1 END,
          "janelaInicio" = CASE
            WHEN "LimitePessoasAdmin"."janelaInicio"
              <= clock_timestamp() - (${regra.segundos}::int * INTERVAL '1 second')
            THEN clock_timestamp() ELSE "LimitePessoasAdmin"."janelaInicio" END
      RETURNING "contador",
        GREATEST(1, CEIL(EXTRACT(EPOCH FROM (
          "janelaInicio" + (${regra.segundos}::int * INTERVAL '1 second') - clock_timestamp()
        )))::int) AS "retryAfter"
    `;
  } catch {
    // Falha fechada: nunca liberar consulta/cadastro se o controle falhar.
    throw new ErroLimitePessoasAdmin("LIMITE_INDISPONIVEL", 503, 60);
  }
  const item = resultado?.[0];
  if (!item || !Number.isInteger(item.contador) ||
    !Number.isInteger(item.retryAfter)) {
    throw new ErroLimitePessoasAdmin("LIMITE_INDISPONIVEL", 503, 60);
  }
  if (item.contador > regra.maximo) {
    throw new ErroLimitePessoasAdmin("LIMITE_EXCEDIDO", 429, item.retryAfter);
  }
  return { restante: regra.maximo - item.contador };
}
