// src/components/CTAButton.jsx
import Link from 'next/link';

// Melhor Prática: Envolver o botão em um componente Link para navegação.
// Se o link for externo, usaríamos uma tag <a> normal. Se for para uma página de checkout no mesmo site, <Link> é ideal.
// Por enquanto, usaremos '#' como placeholder.

const CTAButton = () => {
  return (
    <section className="bg-black py-10 px-4">
      <div className="container mx-auto flex justify-center">
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
          "
        >
          QUERO LUCRAR COM OURO AGORA
        </Link>
      </div>
    </section>
  );
};

export default CTAButton;
