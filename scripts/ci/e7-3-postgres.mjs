// Teste de integracao E7.3. Executar somente contra PostgreSQL descartavel do CI.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { criarServicosPessoasAdmin, traduzirErroPessoa } from "../../src/lib/servicos-pessoas-admin.js";

const url = new URL(process.env.DATABASE_URL || "postgresql://invalid:invalid@invalid/invalid");
assert.equal(process.env.CI, "true", "Execucao permitida somente no CI");
assert.equal(url.hostname, "127.0.0.1", "Proibido testar contra Neon ou banco remoto");
assert.equal(url.port, "5432", "Porta de banco inesperada");
assert.equal(url.pathname, "/ci", "Banco de teste inesperado");
assert.equal(url.username, "ci", "Usuario de banco inesperado");

const prisma = new PrismaClient();
const token = randomUUID().replaceAll("-", "");
const email = (prefixo) => `${prefixo}-${token}@example.test`;
const obterErro = async (operacao) => {
  try {
    await operacao();
    assert.fail("Era esperado um erro");
  } catch (erro) {
    if (erro?.code === "ERR_ASSERTION") throw erro;
    return erro;
  }
};

try {
  const migrations = await prisma.$queryRaw`
    SELECT "migration_name" FROM "_prisma_migrations"
    WHERE "migration_name" = '20261121231000_e7_3_pessoa_autoria_email_ci'
      AND "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL
  `;
  assert.equal(migrations.length, 1, "Migration E7.3 nao aplicada no banco descartavel");

  const indice = await prisma.$queryRaw`
    SELECT indexdef FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'Pessoa'
      AND indexname = 'Pessoa_emailPrincipal_normalizado_uidx'
  `;
  assert.equal(indice.length, 1, "Indice unico funcional E7.3 ausente");
  assert.match(indice[0].indexdef, /UNIQUE INDEX/);
  assert.match(indice[0].indexdef, /lower\(btrim\(/);

  const identidadeAdmin = await prisma.pessoa.create({
    data: { nome: "Operador CI", emailPrincipal: email("operador") },
  });
  const usuario = await prisma.usuario.create({
    data: {
      pessoaId: identidadeAdmin.id,
      status: "ATIVO",
      acessoAdministrativo: { create: { papel: "ADMIN", ativo: true } },
    },
  });
  const servico = criarServicosPessoasAdmin({
    prisma,
    acesso: {
      permitido: true, ehAdmin: true,
      conta: {
        role: "ADMIN", ativo: true,
        mustChangePassword: false, usuarioId: usuario.id,
      },
    },
  });

  const criado = await servico.criar({
    nome: "Pessoa CI",
    emailPrincipal: email("PESSOA").toUpperCase(),
  });
  assert.equal(criado.emailPrincipal, email("pessoa"));
  const registro = await prisma.pessoa.findUniqueOrThrow({ where: { id: criado.id } });
  assert.equal(registro.criadoPorUsuarioId, usuario.id, "Autoria deve usar o Usuario canonico");

  const repetido = await obterErro(() => servico.criar({
    nome: "Pessoa Repetida", emailPrincipal: ` ${email("pessoa").toUpperCase()} `,
  }));
  assert.equal(repetido.codigo, "EMAIL_EM_USO");
  assert.equal(repetido.status, 409);

  // A segunda gravacao ignora a API: o indice deve proteger todos os escritores.
  const colisaoDireta = await obterErro(() => prisma.pessoa.create({
    data: {
      nome: "Tentativa direta",
      emailPrincipal: ` ${email("pessoa").toUpperCase()} `,
    },
  }));
  assert.equal(colisaoDireta.code, "P2002", "Indice funcional deve bloquear duplicidade");
  const traduzido = traduzirErroPessoa(colisaoDireta);
  assert.equal(traduzido.codigo, "EMAIL_EM_USO", "Erro real do Prisma deve ser traduzido para HTTP 409");
  assert.equal(traduzido.status, 409);

  const concorrente = email("concorrente");
  const resultados = await Promise.allSettled([
    servico.criar({ nome: "Concorrente A", emailPrincipal: concorrente }),
    servico.criar({ nome: "Concorrente B", emailPrincipal: concorrente.toUpperCase() }),
  ]);
  const sucessos = resultados.filter((resultado) => resultado.status === "fulfilled");
  const falhas = resultados.filter((resultado) => resultado.status === "rejected");
  assert.equal(sucessos.length, 1, "Duas criacoes concorrentes nao podem ter sucesso");
  assert.equal(falhas.length, 1, "A segunda criacao concorrente deve ser rejeitada");
  assert.equal(falhas[0].reason.codigo, "EMAIL_EM_USO", "Colisao concorrente deve retornar codigo estavel");
  assert.equal(falhas[0].reason.status, 409, "Colisao concorrente deve retornar 409");
  assert.equal(await prisma.pessoa.count({
    where: { emailPrincipal: { equals: concorrente, mode: "insensitive" } },
  }), 1);

  console.log("E7.3 PostgreSQL 17: migration, indice, autoria, colisao direta e concorrencia aprovados.");
} finally {
  await prisma.$disconnect();
}
