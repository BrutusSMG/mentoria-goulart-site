// src/app/api/admin/transacoes/route.js
import { NextResponse } from "next/server";
import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";
import { inteiroLimitado } from "@/lib/validacoes";

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function GET(req) {
  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = inteiroLimitado(searchParams.get("page"), 1, 1, 100000);
    const pageSize = inteiroLimitado(searchParams.get("pageSize"), 20, 10, 100);
    const status = searchParams.get("status") || "all";
    const produtoId = searchParams.get("produtoId") || "all";
    const q = searchParams.get("q")?.trim() || "";

    const filtros = [];

    if (status !== "all") filtros.push({ status });
    if (produtoId !== "all") filtros.push({ produtoId });

    if (q) {
      filtros.push({
        OR: [
          { transacaoCodigo: { contains: q, mode: "insensitive" } },
          { emailComprador: { contains: q, mode: "insensitive" } },
          { produtoNome: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where = filtros.length ? { AND: filtros } : {};
    const skip = (page - 1) * pageSize;

    const [total, items, produtos, statusDisponiveis] = await Promise.all([
      prisma.hotmartTransaction.count({ where }),
      prisma.hotmartTransaction.findMany({
        where,
        select: {
          id: true,
          transacaoCodigo: true,
          emailComprador: true,
          produtoId: true,
          produtoNome: true,
          status: true,
          valorBruto: true,
          moeda: true,
          formaPagamento: true,
          aprovadoEm: true,
          criadoEm: true,
          leadId: true,
        },
        orderBy: { atualizadoEm: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.hotmartTransaction.findMany({
        distinct: ["produtoId"],
        select: { produtoId: true, produtoNome: true },
        orderBy: { produtoNome: "asc" },
      }),
      prisma.hotmartTransaction.findMany({
        distinct: ["status"],
        select: { status: true },
        orderBy: { status: "asc" },
      }),
    ]);

    return respostaPrivada({
      items: items.map((item) => ({
        ...item,
        valorBruto: Number(item.valorBruto),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      produtos,
      statusDisponiveis: statusDisponiveis.map((item) => item.status),
    });
  } catch (error) {
    console.error("Erro ao listar transações:", error?.message);
    return respostaPrivada(
      { error: "Não foi possível carregar as transações." },
      500,
    );
  }
}