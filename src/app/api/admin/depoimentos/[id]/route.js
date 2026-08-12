// src/app/api/admin/depoimentos/[id]/route.js
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const dep = await prisma.depoimento.update({
    where: { id: params.id },
    data: body,
  });
  return Response.json(dep);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Não autorizado" }, { status: 401 });

  await prisma.depoimento.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}