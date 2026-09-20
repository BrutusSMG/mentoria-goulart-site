// src/app/(vendas)/produtos/page.jsx

export const dynamic = 'force-dynamic';

import Products from '@/components/vendas/Products';
import { prisma } from '@/lib/prisma';

// Otimização de SEO para a página de produtos
export const metadata = {
  title: 'Nossos Produtos | Garimpo Urbano',
  description: 'Conheça nossos cursos e e-books sobre extração e refino de metais preciosos.',
};

export default async function ProdutosPage() {
  const produtos = await prisma.produto.findMany({
    select: {
      id: true,
      preco: true,
      moeda: true,
    },
  });

  const precosPorProduto = Object.fromEntries(
    produtos.map((produto) => [
      produto.id,
      {
        preco: produto.preco?.toString() || null,
        moeda: produto.moeda,
      },
    ]),
  );

  return (
    <main className="min-h-screen pt-10">
      <Products precosPorProduto={precosPorProduto} />
    </main>
  );
}
