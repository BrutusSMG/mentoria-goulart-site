// src/app/api/admin/produtos/route.js

import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";

function serializarProduto(produto) {
  return {
    ...produto,
    preco: produto.preco?.toString() ?? null,
    precoPromocional:
      produto.precoPromocional?.toString() ?? null,
  };
}

export async function GET() {
  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  const produtos = await prisma.produto.findMany({
    select: {
      id: true,
      nome: true,
      slug: true,
      tipo: true,
      ativo: true,
      preco: true,
      precoPromocional: true,
      moeda: true,
    },
    orderBy: [
      { tipo: "asc" },
      { nome: "asc" },
    ],
  });

  return Response.json(
    produtos.map(serializarProduto),
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
