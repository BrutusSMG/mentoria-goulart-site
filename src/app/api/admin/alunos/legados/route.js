import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';

import {
  criarAlunoLegado,
} from '@/lib/criar-aluno-legado';

function respostaPrivada(dados, status = 200) {
  return Response.json(dados, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}

function requisicaoMesmaOrigem(request) {
  if (!request?.url) {
    return false;
  }

  const origem = request.headers?.get('origin');

  if (!origem) {
    return false;
  }

  try {
    return (
      new URL(origem).origin ===
      new URL(request.url).origin
    );
  } catch {
    return false;
  }
}

function statusErroCadastroLegado(error) {
  const mensagem =
    error instanceof Error ? error.message : '';

  if (
    mensagem ===
    'J\u00e1 existe um cadastro com este e-mail. ' +
      '\u00c9 necess\u00e1ria uma confer\u00eancia antes de vincular o aluno legado.'
  ) {
    return 409;
  }

  const prefixosValidacao = [
    'Informe ',
    'Telefone inv\u00e1lido.',
    'Identificador de produto inv\u00e1lido.',
    'O mesmo produto n\u00e3o pode ser selecionado duas vezes.',
    'H\u00e1 produtos duplicados no cadastro.',
    'A vig\u00eancia possui produto desconhecido ou duplicado.',
    'Modalidade de vig\u00eancia inv\u00e1lida para ',
    'A modalidade ',
    'Produto n\u00e3o encontrado no cat\u00e1logo:',
    'Produto inativo no cat\u00e1logo:',
    'Produto sem direitos ativos configurados:',
    'Data de cadastro inv\u00e1lida.',
  ];

  if (
    prefixosValidacao.some((prefixo) =>
      mensagem.startsWith(prefixo),
    )
  ) {
    return 400;
  }

  return 500;
}

export async function POST(request) {
  if (
    process.env.CADASTRO_LEGADO_ADMIN_HABILITADO !== 'true'
  ) {
    return respostaPrivada(
      {
        ok: false,
        erro: 'Cadastro de aluno legado indisponível.',
      },
      503,
    );
  }

  if (!requisicaoMesmaOrigem(request)) {
    return respostaPrivada(
      {
        ok: false,
        erro: 'Origem da requisi\u00e7\u00e3o n\u00e3o permitida.',
      },
      403,
    );
  }

  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  let dados;

  try {
    dados = await request.json();
  } catch {
    return respostaPrivada(
      {
        ok: false,
        erro: 'Corpo da requisi\u00e7\u00e3o inv\u00e1lido.',
      },
      400,
    );
  }

  try {
    const resultado = await prisma.$transaction(
      (tx) => criarAlunoLegado(tx, dados),
    );

    return respostaPrivada(
      {
        ok: true,
        item: resultado,
      },
      201,
    );
  } catch (error) {
    const status = statusErroCadastroLegado(error);

    if (status === 500) {
      console.error(
        'Falha operacional no cadastro administrativo de aluno legado.',
      );

      return respostaPrivada(
        {
          ok: false,
          erro: 'N\u00e3o foi poss\u00edvel cadastrar o aluno legado.',
        },
        500,
      );
    }

    return respostaPrivada(
      {
        ok: false,
        erro: error.message,
      },
      status,
    );
  }
}
