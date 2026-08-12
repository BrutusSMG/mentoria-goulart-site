// src/app/api/admin/leads/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
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

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return respostaPrivada({ error: "Não autorizado" }, 401);
  }

  if (session.user?.role !== "ADMIN") {
    return respostaPrivada({ error: "Acesso restrito a administradores" }, 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = inteiroLimitado(searchParams.get("page"), 1, 1, 100000);
    const pageSize = inteiroLimitado(searchParams.get("pageSize"), 20, 10, 100);
    const q = searchParams.get("q")?.trim() || "";
    const source = searchParams.get("source") || "all";
    const ebook = searchParams.get("ebook") || "all";

    const filtros = [];

    if (q) {
      filtros.push({
        OR: [
          { nome: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { whatsapp: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (source !== "all") filtros.push({ utmSource: source });
    if (ebook === "downloaded") filtros.push({ baixouEbook: true });
    if (ebook === "pending") filtros.push({ baixouEbook: false });

    const where = filtros.length > 0 ? { AND: filtros } : {};
    const skip = (page - 1) * pageSize;

    const [total, leads, fontes] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          baixouEbook: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.lead.findMany({
        where: { utmSource: { not: null } },
        distinct: ["utmSource"],
        select: { utmSource: true },
        orderBy: { utmSource: "asc" },
      }),
    ]);

    return respostaPrivada({
      items: leads,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
      sources: fontes.map((item) => item.utmSource).filter(Boolean),
    });
  } catch (error) {
    console.error("Erro ao listar leads:", error);
    return respostaPrivada(
      { error: "Não foi possível carregar os leads." },
      500,
    );
  }
}