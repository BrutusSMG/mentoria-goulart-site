// src/components/VideoTestimonials.jsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle, Star } from 'lucide-react';

const VideoTestimonials = () => {
  // Cole o ID do seu vídeo compilado de depoimentos aqui
  const videoId = "TZyBu67Ep2A"; 

  const [loadVideo, setLoadVideo] = useState(false);

  return (
    // 1. Fundo preto e efeito de "holofote" com gradiente radial
    <section className="relative bg-black py-20 md:py-32 px-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,rgba(0,0,0,0)_50%)]"
        aria-hidden="true"
      />
      
      <div className="relative container mx-auto max-w-4xl text-center">
        
        {/* 2. Título com tratamento especial */}
        <div className="mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            A Prova Real da Transformação
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mt-4">
            Não acredite apenas em nossas palavras. Ouça diretamente de quem já trilhou este caminho e hoje colhe os frutos do Garimpo Urbano.
          </p>
        </div>

        {/* 3. Player de Vídeo com brilho e sombra aprimorados */}
        <div className="
          w-full max-w-4xl aspect-video mx-auto rounded-xl overflow-hidden bg-black
          shadow-[0_0_30px_rgba(34,197,94,0.4),0_0_60px_rgba(34,197,94,0.2)]
          border border-green-500/30
        ">
          {loadVideo ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Depoimentos de alunos do curso Garimpo Urbano"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
           ) : (
            <div onClick={() => setLoadVideo(true)} className="cursor-pointer w-full h-full relative group">
              <Image
                src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Depoimentos de alunos do curso Garimpo Urbano"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px ) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
                <PlayCircle className="h-20 w-20 text-white/80 transition-all duration-300 group-hover:text-white group-hover:scale-110" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoTestimonials;