// src/app/api/admin/depoimentos/route.js
import { prisma, obterAcessoModulo, respostaAcessoNegado } from "@/lib/admin-permissoes";

export async function GET() {
  const acesso = await obterAcessoModulo("DEPOIMENTOS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const depoimentos = await prisma.depoimento.findMany({
    orderBy: [{ destaque: "desc" }, { createdAt: "desc" }],
  });

  return Response.json(depoimentos, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req) {
  const acesso = await obterAcessoModulo("DEPOIMENTOS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const body = await req.json();
  const dados = {
    nome: String(body.nome || "").trim(),
    texto: String(body.texto || "").trim(),
    videoUrl: body.videoUrl ? String(body.videoUrl).trim() : null,
    imagemUrl: body.imagemUrl ? String(body.imagemUrl).trim() : null,
    aprovado: acesso.ehAdmin ? Boolean(body.aprovado) : false,
    destaque: acesso.ehAdmin ? Boolean(body.destaque) : false,
  };

  const depoimento = await prisma.depoimento.create({ data: dados });
  return Response.json(depoimento, { status: 201 });
}