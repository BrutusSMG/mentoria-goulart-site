// src/app/api/admin/sucatas/[id]/route.js
import { prisma, obterAcessoAdmin, obterAcessoModulo, respostaAcessoNegado } from "@/lib/admin-permissoes";

export async function PUT(req, { params }) {
  const acesso = await obterAcessoModulo("SUCATAS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;
  const body = await req.json();

  const item = await prisma.sucataItem.update({
    where: { id },
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

  return Response.json(item);
}

export async function DELETE(req, { params }) {
  const acesso = await obterAcessoAdmin();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;
  await prisma.sucataItem.delete({ where: { id } });
  return Response.json({ success: true });
}