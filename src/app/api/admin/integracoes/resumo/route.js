// src/app/api/admin/integracoes/resumo/route.js
import { NextResponse } from "next/server";
import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";

const STATUS_VENDA_APROVADA = ["APPROVED", "COMPLETE"];
const STATUS_REEMBOLSO = ["REFUNDED", "PARTIALLY_REFUNDED"];

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function numero(valor) {
  return Number(valor || 0);
}

async function consultarBrevo() {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID_EBOOK || "6";

  if (!apiKey) {
    return {
      configurado: false,
      mensagem: "BREVO_API_KEY não está configurada no ambiente.",
      lista: { id: listId, disponivel: false, contatos: null },
      campanhas: { disponivel: false, quantidade: null, enviados: null, entregues: null, aberturasUnicas: null, cliquesUnicos: null },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const headers = { "api-key": apiKey, Accept: "application/json" };

  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 30);

  try {
    const [listaResponse, campanhasResponse] = await Promise.all([
      fetch(
        `https://api.brevo.com/v3/contacts/lists/${encodeURIComponent(listId )}/contacts?limit=1&offset=0`,
        { headers, signal: controller.signal, cache: "no-store" },
      ),
      fetch(
        `https://api.brevo.com/v3/emailCampaigns?limit=50&offset=0&sort=desc&status=sent&statistics=globalStats&startDate=${encodeURIComponent(inicio.toISOString( ))}`,
        { headers, signal: controller.signal, cache: "no-store" },
      ),
    ]);

    const listaJson = listaResponse.ok ? await listaResponse.json() : null;
    const campanhasJson = campanhasResponse.ok ? await campanhasResponse.json() : null;
    const campanhas = Array.isArray(campanhasJson?.campaigns) ? campanhasJson.campaigns : [];

    const totais = campanhas.reduce(
      (acumulado, campanha) => {
        const stats = campanha.globalStats || {};
        acumulado.enviados += numero(stats.sent);
        acumulado.entregues += numero(stats.delivered);
        acumulado.aberturasUnicas += numero(stats.uniqueViews ?? stats.uniqueOpens);
        acumulado.cliquesUnicos += numero(stats.uniqueClicks);
        return acumulado;
      },
      { enviados: 0, entregues: 0, aberturasUnicas: 0, cliquesUnicos: 0 },
    );

    const erros = [];
    if (!listaResponse.ok) erros.push("Não foi possível consultar a lista do e-book.");
    if (!campanhasResponse.ok) erros.push("Não foi possível consultar campanhas enviadas na Brevo.");

    return {
      configurado: true,
      mensagem: erros.length ? erros.join(" ") : null,
      lista: {
        id: listId,
        disponivel: listaResponse.ok,
        contatos: listaResponse.ok ? numero(listaJson?.count) : null,
      },
      campanhas: {
        disponivel: campanhasResponse.ok,
        quantidade: campanhasResponse.ok ? campanhas.length : null,
        ...totais,
      },
    };
  } catch (error) {
    return {
      configurado: true,
      mensagem: `Brevo temporariamente indisponível: ${error.name === "AbortError" ? "tempo limite excedido" : "falha de comunicação"}.`,
      lista: { id: listId, disponivel: false, contatos: null },
      campanhas: { disponivel: false, quantidade: null, enviados: null, entregues: null, aberturasUnicas: null, cliquesUnicos: null },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  try {
    const [
      totalLeads,
      vendasAprovadas,
      reembolsos,
      chargebacks,
      leadsCompradores,
      receitaPorMoeda,
      vendasPorProduto,
      brevo,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.hotmartTransaction.count({
        where: { status: { in: STATUS_VENDA_APROVADA } },
      }),
      prisma.hotmartTransaction.count({
        where: { status: { in: STATUS_REEMBOLSO } },
      }),
      prisma.hotmartTransaction.count({
        where: { status: "CHARGEBACK" },
      }),
      prisma.hotmartTransaction.findMany({
        where: {
          status: { in: STATUS_VENDA_APROVADA },
          leadId: { not: null },
        },
        distinct: ["leadId"],
        select: { leadId: true },
      }),
      prisma.hotmartTransaction.groupBy({
        by: ["moeda"],
        where: { status: { in: STATUS_VENDA_APROVADA } },
        _sum: { valorBruto: true },
      }),
      prisma.hotmartTransaction.groupBy({
        by: ["produtoId", "produtoNome", "moeda"],
        where: { status: { in: STATUS_VENDA_APROVADA } },
        _count: { _all: true },
        _sum: { valorBruto: true },
      }),
      consultarBrevo(),
    ]);

    const leadsConvertidos = leadsCompradores.length;
    const conversaoLeadVenda = totalLeads > 0
      ? Number(((leadsConvertidos / totalLeads) * 100).toFixed(1))
      : 0;

    return respostaPrivada({
      hotmart: {
        vendasAprovadas,
        reembolsos,
        chargebacks,
        leadsConvertidos,
        conversaoLeadVenda,
        receitaPorMoeda: receitaPorMoeda.map((item) => ({
          moeda: item.moeda,
          valor: numero(item._sum.valorBruto),
        })),
        vendasPorProduto: vendasPorProduto
          .map((item) => ({
            produtoId: item.produtoId,
            produtoNome: item.produtoNome,
            moeda: item.moeda,
            vendas: item._count._all,
            receita: numero(item._sum.valorBruto),
          }))
          .sort((a, b) => b.receita - a.receita),
      },
      brevo,
    });
  } catch (error) {
    console.error("Erro ao montar resumo de integrações:", error?.message);
    return respostaPrivada(
      { error: "Não foi possível carregar as métricas das integrações." },
      500,
    );
  }
}