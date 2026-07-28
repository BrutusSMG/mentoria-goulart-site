// src/app/produtos/page.js
export const dynamic = 'force-dynamic';
import Products from '@/components/Products';

// Otimização de SEO para a página de produtos
export const metadata = {
  title: 'Nossos Produtos | Garimpo Urbano',
  description: 'Conheça nossos cursos e e-books sobre extração e refino de metais preciosos.',
};

export default function ProdutosPage() {
  return (
    <main className="min-h-screen pt-10">
      <Products />
    </main>
  );
}