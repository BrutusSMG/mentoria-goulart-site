// src/components/Products.jsx

import Link from 'next/link';
import { BookOpen, GraduationCap, Star } from 'lucide-react';

// Array com todos os produtos para facilitar a manutenção
const productsList = [
  {
    id: 1,
    title: 'Curso Garimpo Urbano com Mentoria',
    type: 'Curso Premium',
    price: 'R$ 2.497,00',
    icon: <GraduationCap className="h-8 w-8 text-yellow-400" />,
    highlight: true, // Flag para destacar este produto
    link: '/mentoria', // Link para a página de vendas que já criamos
  },
  {
    id: 2,
    title: 'Curso Garimpo Urbano (Sem Mentoria)',
    type: 'Curso Online',
    price: 'R$ 997,00',
    icon: <GraduationCap className="h-8 w-8 text-yellow-500" />,
    highlight: false,
    link: 'https://go.hotmart.com/U107226996B?dp=1',
  },
  {
    id: 3,
    title: 'Curso de Eletrodeposição em Joias e Semi-Joias',
    type: 'Curso Online',
    price: 'R$ 147,00',
    icon: <GraduationCap className="h-8 w-8 text-yellow-500" />,
    highlight: false,
    link: 'https://go.hotmart.com/H106605361V?dp=1',
  },
  {
    id: 4,
    title: 'Guia Definitivo do Garimpo Urbano',
    type: 'E-book',
    price: 'R$ 198,00',
    icon: <BookOpen className="h-8 w-8 text-blue-400" />,
    highlight: false,
    link: 'https://go.hotmart.com/B106605360L?dp=1',
  },
  {
    id: 5,
    title: 'Recuperação de Metais Preciosos de Resíduos de Oficinas',
    type: 'E-book',
    price: 'R$ 198,00',
    icon: <BookOpen className="h-8 w-8 text-blue-400" />,
    highlight: false,
    link: 'https://go.hotmart.com/V106605378M?dp=1',
  },
  {
    id: 6,
    title: 'TESOUROS ESCONDIDOS - Extração e Refino de Ouro e Prata',
    type: 'E-book',
    price: 'R$ 49,70',
    icon: <BookOpen className="h-8 w-8 text-blue-400" />,
    highlight: false,
    link: 'https://go.hotmart.com/F106605366M?dp=1',
  },
  {
    id: 7,
    title: 'ELETRODEPOSIÇÃO - Galvanoplastia para a Indústria de Joias',
    type: 'E-book',
    price: 'R$ 47,00',
    icon: <BookOpen className="h-8 w-8 text-blue-400" />,
    highlight: false,
    link: 'https://go.hotmart.com/Q106605376S?dp=1',
  },
];

const Products = () => {
  return (
    <section className="bg-black py-20 px-4" id="produtos">
      <div className="container mx-auto max-w-6xl">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Nossos <span className="text-yellow-500">Produtos</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Escolha o formato ideal para o seu momento e comece a lucrar com a metalurgia nobre.
          </p>
        </div>

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsList.map((product) => (
            <div 
              key={product.id} 
              className={`relative flex flex-col bg-gray-900 rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
                product.highlight 
                  ? 'border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 lg:scale-105 z-10' 
                  : 'border border-gray-800 hover:border-yellow-500/50'
              }`}
            >
              {/* Selo de Destaque (Apenas para o produto principal) */}
              {product.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg">
                  <Star className="h-4 w-4 fill-black" /> MAIS VENDIDO
                </div>
              )}

              {/* Ícone e Tipo */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-black rounded-lg">
                  {product.icon}
                </div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {product.type}
                </span>
              </div>

              {/* Título do Produto */}
              <h3 className="text-xl font-bold text-white mb-4 grow">
                {product.title}
              </h3>

              {/* Preço e Botão */}
              <div className="mt-auto pt-6 border-t border-gray-800">
                <p className="text-3xl font-extrabold text-white mb-6">
                  {product.price}
                </p>
                <Link 
                  href={product.link}
                  className={`w-full block text-center font-bold py-3 px-4 rounded-lg transition-colors ${
                    product.highlight
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  Saiba Mais
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Products;
