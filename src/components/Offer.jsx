// src/components/Offer.jsx
import Link from 'next/link';

const Offer = () => {
  return (
    <section className="bg-black py-16 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        {/* Título da Oferta */}
        <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-400 mb-4">
          Oferta Especial
        </h2>

        {/* Bloco de Preço */}
        <div className="mb-8">
          <p className="text-xl text-gray-400 line-through">
            De R$5997,00
          </p>
          <p className="text-lg text-white mb-2">
            Por apenas 12x de
          </p>
          <p className="text-7xl md:text-8xl font-extrabold text-green-500">
            R$206,54
          </p>
          <p className="text-lg text-white mt-2">
            ou R$1997,00 à vista
          </p>
        </div>

        {/* Botão de CTA (reutilizando o estilo do componente CTAButton) */}
        <div className="mt-10">
          <Link 
            href="#" // Substitua pelo link de checkout/compra
            className="
              bg-green-500 
              text-white 
              font-bold 
              text-2xl 
              md:text-3xl 
              py-5 
              px-8 
              rounded-lg 
              shadow-lg 
              shadow-green-500/50
              hover:bg-green-600 
              hover:scale-105
              transition-all 
              duration-300 
              ease-in-out
              animate-pulse
              inline-block
            "
          >
            QUERO LUCRAR COM OURO AGORA
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Offer;
