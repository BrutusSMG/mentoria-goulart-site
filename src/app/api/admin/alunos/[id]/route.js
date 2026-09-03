// src/app/api/admin/alunos/[id]/route.js
import { obterAcessoAdmin, prisma, respostaAcessoNegado } from "@/lib/admin-permissoes";

function respostaPrivada(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

function serializarValor(valor) {
  return valor === null || valor === undefined ? null : Number(valor);
}

export async function GET(_req, { params }) {
  const acesso = await obterAcessoAdmin();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return respostaPrivada({ error: "Aluno inválido." }, 400);
  }

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        status: true,
        origem: true,
        emailVerificadoEm: true,
        ultimoLoginEm: true,
        createdAt: true,
        updatedAt: true,
        perfil: {
          select: {
            nomeExibicao: true,
            fotoUrl: true,
            cidade: true,
            estado: true,
            bio: true,
            experiencia: true,
            objetivos: true,
            mostrarFoto: true,
            mostrarLocalizacao: true,
            mostrarBio: true,
            mostrarExperiencia: true,
            mostrarObjetivos: true,
            mostrarWhatsapp: true,
            visibilidade: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        matriculas: {
          select: {
            id: true,
            produtoId: true,
            produtoUcode: true,
            produtoNome: true,
            origem: true,
            status: true,
            concedidaEm: true,
            suspensaEm: true,
            encerradaEm: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        transacoesHotmart: {
          select: {
            id: true,
            transacaoCodigo: true,
            produtoId: true,
            produtoUcode: true,
            produtoNome: true,
            status: true,
            valorBruto: true,
            moeda: true,
            formaPagamento: true,
            parcelas: true,
            aprovadoEm: true,
            criadoEm: true,
            atualizadoEm: true,
          },
          orderBy: { criadoEm: "desc" },
        },
      },
    });

    if (!aluno) {
      return respostaPrivada({ error: "Aluno não encontrado." }, 404);
    }

    return respostaPrivada({
      item: {
        ...aluno,
        transacoesHotmart: aluno.transacoesHotmart.map((transacao) => ({
          ...transacao,
          valorBruto: serializarValor(transacao.valorBruto),
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao carregar detalhe administrativo do aluno:", error?.message);
    return respostaPrivada(
      { error: "Não foi possível carregar os detalhes do aluno." },
      500,
    );
  }
}
