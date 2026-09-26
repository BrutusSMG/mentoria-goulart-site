import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';

import {
  verificarElegibilidadeConviteLegado,
} from '@/lib/elegibilidade-convite-legado';

import {
  executarPrimeiroConviteLegado,
} from '@/lib/executar-primeiro-convite-legado';

const ENDERECOS_ALUNO_PERMITIDOS = new Set([
  'https://mentoria-goulart-site.vercel.app/aluno',
  'https://aluno.mentoriagarimpourbano.com.br',
]);

function configuracaoEnvioPronta() {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return false;
  }

  const endereco = process.env.NEXT_PUBLIC_ALUNO_URL;

  if (!endereco || endereco !== endereco.trim()) {
    return false;
  }

  try {
    const url = new URL(endereco);

    return (
      ENDERECOS_ALUNO_PERMITIDOS.has(endereco) &&
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function respostaPrivada(dados, status) {
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
    const urlRequisicao = new URL(request.url);
    const urlOrigem = new URL(origem);

    return urlOrigem.origin === urlRequisicao.origin;
  } catch {
    return false;
  }
}

export async function POST(request, { params }) {
  // Primeiro bloqueio: a funcionalidade administrativa
  // permanece desabilitada por padrão.
  if (
    process.env.CONVITE_LEGADO_ADMIN_HABILITADO !== 'true'
  ) {
    return respostaPrivada(
      { ok: false, erro: 'Envio de convite indisponível.' },
      503,
    );
  }

  if (!requisicaoMesmaOrigem(request)) {
    return respostaPrivada(
      {
        ok: false,
        erro: 'Origem da requisição não permitida.',
      },
      403,
    );
  }

  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  const { id } = await params;

  if (typeof id !== 'string' || !id.trim()) {
    return respostaPrivada(
      { ok: false, erro: 'Aluno inválido.' },
      400,
    );
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        origem: true,
        status: true,
        senhaHash: true,
        emailVerificadoEm: true,
        conviteLegadoEnviadoEm: true,
        pessoaId: true,
        pessoa: {
          select: {
            id: true,
            emailPrincipal: true,
            ativo: true,
          },
        },
      },
    });

    if (!aluno) {
      return respostaPrivada(
        { ok: false, erro: 'Aluno não encontrado.' },
        404,
      );
    }

    const elegibilidade =
      verificarElegibilidadeConviteLegado(aluno);

    if (!elegibilidade.permitido) {
      return respostaPrivada(
        { ok: false, erro: elegibilidade.motivo },
        409,
      );
    }

    // Segundo bloqueio: mesmo após autorização e consulta,
    // nenhuma tentativa é preparada enquanto esta flag
    // adicional permanecer desabilitada.
    if (
      process.env.CONVITE_LEGADO_ENVIO_REAL_HABILITADO !== 'true'
    ) {
      return respostaPrivada(
        {
          ok: false,
          elegivel: true,
          erro: 'Envio de convite não habilitado.',
        },
        503,
      );
    }

    if (!configuracaoEnvioPronta()) {
      return respostaPrivada(
        {
          ok: false,
          erro: 'Configuração de envio indisponível.',
        },
        503,
      );
    }

    // A função faz uma NOVA verificação de elegibilidade
    // dentro da transação de preparação.
    const resultado = await executarPrimeiroConviteLegado({
      prisma,
      alunoId: id,
    });

    if (resultado.estado === 'RECUSADO') {
      return respostaPrivada(
        {
          ok: false,
          estado: 'RECUSADO',
          erro: resultado.motivo,
        },
        409,
      );
    }

    if (resultado.estado === 'ENVIADO') {
      return respostaPrivada(
        {
          ok: true,
          estado: 'ENVIADO',
          mensagem: 'Convite aceito pelo provedor de e-mail.',
        },
        200,
      );
    }

    if (resultado.estado === 'FALHA') {
      return respostaPrivada(
        {
          ok: false,
          estado: 'FALHA',
          erro: 'O convite não foi enviado. É necessária conferência.',
        },
        503,
      );
    }

    if (
      resultado.estado === 'INDETERMINADO' ||
      resultado.estado === 'CONFERIR'
    ) {
      return respostaPrivada(
        {
          ok: false,
          estado: resultado.estado,
          erro: 'O resultado do convite exige conferência manual.',
        },
        409,
      );
    }

    return respostaPrivada(
      {
        ok: false,
        erro: 'Resultado de convite não reconhecido.',
      },
      500,
    );
  } catch {
    // Não registrar tokens, e-mails ou outros dados
    // eventualmente presentes em mensagens de exceção.
    console.error(
      'Falha operacional na rota administrativa de convite legado.',
    );

    return respostaPrivada(
      {
        ok: false,
        erro: 'Não foi possível concluir a operação de convite.',
      },
      500,
    );
  }
}
