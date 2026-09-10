// src/lib/aviso-expiracao.js

export const DIAS_AVISO_EXPIRACAO = 30;

export function vigenciaElegivelParaAviso(
  vigencia,
  agora = new Date(),
  diasAntecedencia = DIAS_AVISO_EXPIRACAO,
) {
  if (!vigencia) {
    return false;
  }

  if (vigencia.avisoExpiracaoEnviadoEm) {
    return false;
  }

  if (!['AGENDADA', 'ATIVA'].includes(vigencia.status)) {
    return false;
  }

  if (!(vigencia.iniciaEm instanceof Date) || vigencia.iniciaEm > agora) {
    return false;
  }

  if (!(vigencia.expiraEm instanceof Date)) {
    return false;
  }

  if (vigencia.expiraEm <= agora) {
    return false;
  }

  const limite = new Date(
    agora.getTime() + diasAntecedencia * 24 * 60 * 60 * 1000,
  );

  return vigencia.expiraEm <= limite;
}

export async function buscarVigenciasParaAviso(
  agora = new Date(),
  db,
  diasAntecedencia = DIAS_AVISO_EXPIRACAO,
) {
  if (!db?.vigenciaMatricula?.findMany) {
    throw new Error('Banco de dados inválido.');
  }

  const limite = new Date(
    agora.getTime() + diasAntecedencia * 24 * 60 * 60 * 1000,
  );

  return db.vigenciaMatricula.findMany({
    where: {
      avisoExpiracaoEnviadoEm: null,

      status: {
        in: ['AGENDADA', 'ATIVA'],
      },

      iniciaEm: {
        lte: agora,
      },

      expiraEm: {
        gt: agora,
        lte: limite,
      },

      matricula: {
        status: 'ATIVA',

        aluno: {
          status: 'ATIVO',
        },
      },
    },

    select: {
      id: true,
      expiraEm: true,

      matricula: {
        select: {
          produtoNome: true,

          aluno: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: {
      expiraEm: 'asc',
    },
  });
}

function escaparHtml(valor = '') {
  const caracteres = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(valor).replace(
    /[&<>"']/g,
    (caractere) => caracteres[caractere],
  );
}

export function criarEmailAvisoExpiracao(vigencia) {
  const aluno = vigencia?.matricula?.aluno;
  const produtoNome = vigencia?.matricula?.produtoNome;

  if (
    !vigencia?.id ||
    !(vigencia?.expiraEm instanceof Date) ||
    !aluno?.email
  ) {
    throw new Error('Dados insuficientes para aviso de expiração.');
  }

  const nome = escaparHtml(aluno.nome || 'Aluno');
  const produto = escaparHtml(produtoNome || 'seu acesso');

  const dataExpiracao = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(vigencia.expiraEm);

  return {
    from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
    to: aluno.email,
    subject: `Seu acesso ao ${produtoNome || 'Garimpo Urbano'} está próximo do vencimento`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:16px">
        <p style="color:#d89900;font-weight:bold;letter-spacing:2px">GARIMPO URBANO</p>
        <h1>Olá, ${nome}.</h1>
        <p>
          Seu período de acesso ao <strong>${produto}</strong>
          está próximo do vencimento.
        </p>
        <p>
          Data final de acesso:
          <strong>${dataExpiracao}</strong>.
        </p>
        <p style="color:#a3a3a3;font-size:13px">
          Este é um aviso automático para que você possa se organizar antes
          do término da sua vigência.
        </p>
      </div>
    `,
    idempotencyKey: `aviso-expiracao/${vigencia.id}`,
  };
}

export async function enviarAvisoExpiracao(
  vigencia,
  {
    resend,
    db,
    agora = new Date(),
  },
) {
  if (!resend?.emails?.send) {
    throw new Error('Cliente Resend inválido.');
  }

  if (!db?.vigenciaMatricula?.updateMany) {
    throw new Error('Banco de dados inválido.');
  }

  const email = criarEmailAvisoExpiracao(vigencia);
  const {
    idempotencyKey,
    ...payload
  } = email;

  const resultado = await resend.emails.send(
    payload,
    {
      idempotencyKey,
    },
  );

  if (resultado?.error) {
    throw new Error(
      resultado.error.message || 'Falha ao enviar aviso de expiração.',
    );
  }

  const atualizacao = await db.vigenciaMatricula.updateMany({
    where: {
      id: vigencia.id,
      avisoExpiracaoEnviadoEm: null,
    },
    data: {
      avisoExpiracaoEnviadoEm: agora,
    },
  });

  return {
    enviado: true,
    registrado: atualizacao.count > 0,
    emailId: resultado?.data?.id || null,
  };
}

export async function processarAvisosExpiracao({
  agora = new Date(),
  resend,
  db,
  diasAntecedencia = DIAS_AVISO_EXPIRACAO,
}) {
  const vigencias = await buscarVigenciasParaAviso(
    agora,
    db,
    diasAntecedencia,
  );

  const resultados = [];

  for (const vigencia of vigencias) {
    try {
      const resultado = await enviarAvisoExpiracao(vigencia, {
        resend,
        db,
        agora,
      });

      resultados.push({
        vigenciaId: vigencia.id,
        sucesso: true,
        registrado: resultado.registrado,
        emailId: resultado.emailId,
      });
    } catch (error) {
      resultados.push({
        vigenciaId: vigencia.id,
        sucesso: false,
        erro: error?.message || 'Erro desconhecido.',
      });
    }
  }

  const enviados = resultados.filter(
    (resultado) => resultado.sucesso,
  ).length;

  const falhas = resultados.length - enviados;

  return {
    encontrados: vigencias.length,
    enviados,
    falhas,
    resultados,
  };
}