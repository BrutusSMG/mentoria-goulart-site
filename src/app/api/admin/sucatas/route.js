// src/app/api/admin/sucatas/route.js
import { prisma, obterAcessoModulo, respostaAcessoNegado } from "@/lib/admin-permissoes";
import {
  imagemUrlValida,
  valorMonetarioValido,
} from "@/lib/validacoes";

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
  if (!valorMonetarioValido(body.valorKg)) {
    return Response.json(
      { error: "Informe um valor por kg válido." },
      { status: 400 },
    );
  }

  if (!imagemUrlValida(body.imagemUrl)) {
    return Response.json(
      { error: "Informe uma URL de imagem válida." },
      { status: 400 },
    );
  }
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