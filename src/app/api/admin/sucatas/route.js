// src/app/api/admin/sucatas/route.js
import { prisma, obterAcessoModulo, respostaAcessoNegado } from "@/lib/admin-permissoes";

export async function GET() {
  const acesso = await obterAcessoModulo("SUCATAS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const sucatas = await prisma.sucataItem.findMany({
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });

  return Response.json(sucatas, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req) {
  const acesso = await obterAcessoModulo("SUCATAS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const body = await req.json();
  const item = await prisma.sucataItem.create({
    data: {
      nome: String(body.nome || "").trim(),
      categoria: String(body.categoria || "").trim(),
      valorKg: Number(body.valorKg),
      metais: String(body.metais || "").trim(),
      imagemUrl: body.imagemUrl ? String(body.imagemUrl).trim() : null,
      ativo: body.ativo ?? true,
      atualizadoPor: acesso.conta.id,
    },
  });

  return Response.json(item, { status: 201 });
}