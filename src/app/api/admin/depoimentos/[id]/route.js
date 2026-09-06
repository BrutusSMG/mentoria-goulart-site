// src/app/api/admin/depoimentos/[id]/route.js
import { prisma, obterAcessoAdmin, obterAcessoModulo, respostaAcessoNegado } from "@/lib/admin-permissoes";
import { imagemUrlValida } from "@/lib/validacoes";

export async function PUT(req, { params }) {
  const acesso = await obterAcessoModulo("DEPOIMENTOS");
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;
  const body = await req.json();

  const atual = await prisma.depoimento.findUnique({ where: { id } });

  if (!atual) {
    return Response.json(
      { error: "Depoimento não encontrado." },
      { status: 404 },
    );
  }

  if (
    body.imagemUrl !== undefined &&
    !imagemUrlValida(body.imagemUrl)
  ) {
    return Response.json(
      { error: "Informe uma URL de imagem válida." },
      { status: 400 },
    );
  }

  const dados = {
    nome: body.nome === undefined ? atual.nome : String(body.nome).trim(),
    texto: body.texto === undefined ? atual.texto : String(body.texto).trim(),
    videoUrl: body.videoUrl === undefined ? atual.videoUrl : (body.videoUrl ? String(body.videoUrl).trim() : null),
    imagemUrl: body.imagemUrl === undefined ? atual.imagemUrl : (body.imagemUrl ? String(body.imagemUrl).trim() : null),
  };

  if (acesso.ehAdmin) {
    dados.aprovado = body.aprovado === undefined ? atual.aprovado : Boolean(body.aprovado);
    dados.destaque = body.destaque === undefined ? atual.destaque : Boolean(body.destaque);
  }

  const depoimento = await prisma.depoimento.update({ where: { id }, data: dados });
  return Response.json(depoimento);
}

export async function DELETE(req, { params }) {
  const acesso = await obterAcessoAdmin();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;
  await prisma.depoimento.delete({ where: { id } });
  return Response.json({ success: true });
}