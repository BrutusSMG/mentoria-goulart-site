// src/components/Hero.jsx

"use client";
import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle, ChevronsDown } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {

  const [loadVideo, setLoadVideo] = useState(false);
  const videoId = 'ldgfDfpDo1w';
  
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
        <div className="my-8 text-center">
          <p className="text-xl md:text-2xl text-gray-300 mb-6">
            Mesmo que você seja um completo iniciante, aprenda a encontrar e refinar metais preciosos em:
          </p>
          {/* Lista de Oportunidades */}
          <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap text-lg">
            <span className="bg-gray-800 px-4 py-2 rounded-full">♻️ Lixo Eletrônico</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">🚗 Catalisadores</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">💍 Resíduos de Joalheria</span>
            <span className="bg-gray-800 px-4 py-2 rounded-full">...e muito mais!</span>
          </div>
        </div>
        
        {/* Container do Vídeo com proporção 16:9 */}
        <div className="mt-10 w-full max-w-5xl p-6 md:p-8 border-2 border-gray-700 rounded-lg shadow-2xl shadow-green-500/10">
          <div className="mb-8">
            <div className="flex flex-col items-center justify-center gap-4 mb-4">
              <span className="text-2xl font-semibold tracking-wider text-gray-300">
                O CURSO
              </span>
              <Image
                src="/GUText.png" // Certifique-se que o nome do arquivo corresponde
                alt="Garimpo Urbano - Recuperação de Metais Preciosos"
                width={600} // Ajuste a largura conforme o tamanho da sua imagem
                height={100} // Ajuste a altura para manter a proporção
                className="h-auto w-full max-w-md"  // Garante que a altura se ajuste se a largura for responsiva
              />
            </div>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              É um treinamento <strong className="text-white">100% online</strong> com um objetivo claro: ensinar você a transformar sucata em um <strong className="text-white">negócio lucrativo em apenas 30 dias.</strong>
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-2">
              <span className="font-semibold">Assista ao vídeo abaixo para entender</span>
              <ChevronsDown className="h-18 w-28 text-green-500 animate-bounce" />
            </div>
          </div>
          <div className="w-full aspect-video rounded-lg overflow-hidden relative">
            {!loadVideo ? (
              <div onClick={() => setLoadVideo(true)} className="cursor-pointer w-full h-full relative">
                <Image
                  src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                  alt="Thumbnail do vídeo da mentoria"
                  fill
                  className="object-cover z-10"
                  priority
                  sizes="(max-width: 1024px ) 100vw, 1024px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-0">
                  <PlayCircle className="h-20 w-20 text-white/80 hover:text-white transition-transform hover:scale-110" />
                </div>
              </div>
            ) : (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title="Player de vídeo da mentoria"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>          
          <div className="mt-8">
            <Link 
              href="#"
              className="inline-block bg-green-500 text-white font-bold text-2xl md:text-3xl py-5 px-8 rounded-lg shadow-lg shadow-green-500/50 hover:bg-green-600 hover:scale-105 transition-all duration-300 ease-in-out animate-pulse"
            >
              QUERO LUCRAR COM OURO AGORA
            </Link>
          </div>
        </div>
      </div>
    </section>
   );
};

export default Hero;
