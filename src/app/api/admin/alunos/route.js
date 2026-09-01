// src/app/api/admin/alunos/route.js
import { obterAcessoAdmin, prisma, respostaAcessoNegado } from "@/lib/admin-permissoes";

function respostaPrivada(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

function inteiroLimitado(valor, padrao, minimo, maximo) {
  const numero = Number.parseInt(valor, 10);
  if (Number.isNaN(numero)) return padrao;
  return Math.min(Math.max(numero, minimo), maximo);
}

const STATUS_VALIDOS = new Set([
  "PENDENTE_ACESSO",
  "ATIVO",
  "SUSPENSO",
  "INATIVO",
]);

function rotuloStatus(status) {
  const rotulos = {
    PENDENTE_ACESSO: "Pendente de acesso",
    ATIVO: "Ativo",
    SUSPENSO: "Suspenso",
    INATIVO: "Inativo",
  };
  return rotulos[status] || status;
}

export async function GET(req) {
  const acesso = await obterAcessoAdmin();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  try {
    const { searchParams } = new URL(req.url);
    const page = inteiroLimitado(searchParams.get("page"), 1, 1, 100000);
    const pageSize = inteiroLimitado(searchParams.get("pageSize"), 20, 10, 100);
    const busca = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || "all";

    const filtros = [];

    if (busca) {
      filtros.push({
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { email: { contains: busca, mode: "insensitive" } },
        ],
      });
    }

    if (status !== "all" && STATUS_VALIDOS.has(status)) {
      filtros.push({ status });
    }

    const where = filtros.length > 0 ? { AND: filtros } : {};
    const skip = (page - 1) * pageSize;

    const [total, alunos] = await Promise.all([
      prisma.aluno.count({ where }),
      prisma.aluno.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          status: true,
          origem: true,
          ultimoLoginEm: true,
          createdAt: true,
          perfil: {
            select: {
              visibilidade: true,
            },
          },
          matriculas: {
            select: {
              id: true,
              produtoId: true,
              produtoNome: true,
              status: true,
              concedidaEm: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    const items = alunos.map((aluno) => ({
      ...aluno,
      statusRotulo: rotuloStatus(aluno.status),
      produtos: aluno.matriculas.map((matricula) => matricula.produtoNome),
    }));

    return respostaPrivada({
      items,
      statusDisponiveis: Array.from(STATUS_VALIDOS).map((valor) => ({
        valor,
        rotulo: rotuloStatus(valor),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Erro ao listar alunos administrativos:", error);
    return respostaPrivada(
      { error: "Não foi possível carregar os alunos." },
      500,
    );
  }
}