import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from '@/lib/admin-permissoes';

import { verificarElegibilidadeConviteLegado } from
  '@/lib/elegibilidade-convite-legado';

function respostaPrivada(dados, status) {
  return Response.json(dados, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}

export async function POST(_request, { params }) {
  // Desabilitada por padrão em todos os ambientes.
  if (
    process.env.CONVITE_LEGADO_ADMIN_HABILITADO !== 'true'
  ) {
    return respostaPrivada(
      { ok: false, erro: 'Envio de convite indisponível.' },
      503,
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

    // Esta etapa é somente uma conferência.
    // Não reserva tentativa, não cria token e não envia e-mail.
    return respostaPrivada(
      {
        ok: false,
        elegivel: true,
        erro: 'Envio de convite ainda não implementado.',
      },
      503,
    );
  } catch (error) {
    console.error(
      'Erro ao conferir elegibilidade do convite legado:',
      error?.message,
    );

    return respostaPrivada(
      {
        ok: false,
        erro: 'Não foi possível conferir o cadastro do aluno.',
      },
      500,
    );
  }
}
