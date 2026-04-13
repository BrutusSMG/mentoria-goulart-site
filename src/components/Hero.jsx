// src/components/Hero.jsx
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="bg-black text-white text-center py-12 px-4">
      <div className="container mx-auto flex flex-col items-center">
        {/* Selo de Vagas Abertas */}
        <div className="bg-green-500 text-black font-bold uppercase px-4 py-1 rounded-md mb-6">
          Vagas Abertas
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 max-w-4xl">
          Aprenda a lucrar com Ouro todos os dias
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Mesmo que você seja um completo iniciante
        </p>
        
        {/* Container do Vídeo com proporção 16:9 */}
        <div className="w-full max-w-4xl aspect-video shadow-lg shadow-green-500/20">
          {/* 
            Melhor Prática: O ideal para vídeos é usar um player otimizado como Vime-React ou Plyr.
            Para começar, um iframe é suficiente. A classe 'aspect-video' do Tailwind mantém a proporção correta.
          */}
          <iframe 
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/ldgfDfpDo1w" // SUBSTITUA pelo ID do vídeo correto 
            title="Player de vídeo da mentoria" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          >
          </iframe>
        </div>
      </div>
    </section>
   );
};

export default Hero;
