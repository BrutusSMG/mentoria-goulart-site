// src/app/api/admin/produtos/[id]/route.js

import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";
import { valorMonetarioValido } from "@/lib/validacoes";

const PRECO_MAXIMO = 9999999999.99;

function normalizarPreco(preco) {
  if (!valorMonetarioValido(preco)) {
    return null;
  }

  const texto = String(preco).trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(texto)) {
    return null;
  }

  const numero = Number(texto);

  if (!Number.isFinite(numero) || numero > PRECO_MAXIMO) {
    return null;
  }

  return numero.toFixed(2);
}

function serializarProduto(produto) {
  return {
    ...produto,
    preco: produto.preco?.toString() ?? null,
    precoPromocional:
      produto.precoPromocional?.toString() ?? null,
  };
}

export async function PUT(req, { params }) {
  const acesso = await obterAcessoAdmin();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  const { id } = await params;
  const body = await req.json();

  const preco = normalizarPreco(body.preco);

  if (preco === null) {
    return Response.json(
      {
        error:
          "Informe um pre\u00e7o v\u00e1lido com no m\u00e1ximo 2 casas decimais.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  }

  const existente = await prisma.produto.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existente) {
    return Response.json(
      { error: "Produto n\u00e3o encontrado." },
      {
        status: 404,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      preco,
    },
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
  });

  return Response.json(
    serializarProduto(produto),
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
