// src/app/api/admin/dashboard/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return respostaPrivada({ error: "Não autorizado" }, 401);
  }

  if (session.user?.role !== "ADMIN") {
    return respostaPrivada({ error: "Acesso restrito a administradores" }, 403);
  }

  try {
    const inicioUltimosSeteDias = new Date();
    inicioUltimosSeteDias.setDate(inicioUltimosSeteDias.getDate() - 7);

    const [totalLeads, ebooksBaixados, leadsUltimosSeteDias, leadsRecentes] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({
        where: { baixouEbook: true },
      }),
      prisma.lead.count({
        where: {
          createdAt: { gte: inicioUltimosSeteDias },
        },
      }),
      prisma.lead.findMany({
        select: {
          id: true,
          nome: true,
          email: true,
          baixouEbook: true,
          utmSource: true,
          utmCampaign: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const aguardandoDownload = totalLeads - ebooksBaixados;
    const taxaDownload = totalLeads > 0
      ? Number(((ebooksBaixados / totalLeads) * 100).toFixed(1))
      : 0;

    return respostaPrivada({
      resumo: {
        totalLeads,
        ebooksBaixados,
        aguardandoDownload,
        taxaDownload,
        leadsUltimosSeteDias,
      },
      funil: {
        captados: totalLeads,
        baixaramEbook: ebooksBaixados,
        aguardandoDownload,
      },
      leadsRecentes,
    });
  } catch (error) {
    console.error("Erro ao montar métricas do dashboard:", error);
    return respostaPrivada(
      { error: "Não foi possível carregar as métricas do dashboard." },
      500,
    );
  }
}