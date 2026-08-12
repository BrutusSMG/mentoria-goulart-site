// src/app/api/admin/depoimentos/route.js
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const depoimentos = await prisma.depoimento.findMany({
    orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
  });
  return Response.json(depoimentos);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const dep = await prisma.depoimento.create({
    data: {
      nome: body.nome,
      texto: body.texto,
      videoUrl: body.videoUrl || null,
      imagemUrl: body.imagemUrl || null,
      aprovado: body.aprovado ?? false,
      destaque: body.destaque ?? false,
    },
  });
  return Response.json(dep);
}