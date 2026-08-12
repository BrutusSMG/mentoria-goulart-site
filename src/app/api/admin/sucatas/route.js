// src/app/api/admin/sucatas/route.js
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const sucatas = await prisma.sucataItem.findMany({
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });
  return Response.json(sucatas);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.sucataItem.create({
    data: {
      nome: body.nome,
      categoria: body.categoria,
      valorKg: body.valorKg,
      metais: body.metais,
      imagemUrl: body.imagemUrl || null,
      ativo: body.ativo ?? true,
      atualizadoPor: session.user.email,
    },
  });
  return Response.json(item);
}