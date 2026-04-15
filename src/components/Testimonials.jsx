// src/components/Testimonials.jsx
"use client";

import React, { useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

// Array com os nomes das imagens dos depoimentos
const testimonialImages = Array.from({ length: 8 }, (_, i) => {
  const number = i + 1;
  const paddedNumber = number < 10 ? `0${number}` : number;
  return `depoimento-${paddedNumber}.jpg`;
});

const Testimonials = () => {
  // Configura o carrossel com o plugin de autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, // Faz o carrossel voltar ao início quando chega ao fim
      align: 'start',
    }, 
    [Autoplay({ delay: 4000, stopOnInteraction: true })] // Autoplay de 4 segundos
  );

  // Funções para os botões de navegação
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            O Que os Alunos Dizem
          </h2>
          <p className="text-xl text-gray-300 mt-4">
            Você está a um passo de ter resultados como estes:
          </p>

        </div>
        

        {/* O Carrossel */}
        <div className="relative">
          {/* Viewport do carrossel */}
          <div className="overflow-hidden" ref={emblaRef}>
            {/* Container dos slides */}
            <div className="flex">
              {testimonialImages.map((imageName, index) => (
                // Cada slide
                <div 
                  key={index} 
                  // Define a largura dos slides para criar o efeito de 4, 3, 2 ou 1 por vez
                  className="flex-shrink-0 flex-grow-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-2"
                >
                  <div className="relative w-full h-150 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={`/testimonials/${imageName}`}
                      alt={`Depoimento de aluno ${index + 1}`}
                      fill
                      objectFit="contain"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Navegação */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between -translate-y-1/2 px-4">
            <button onClick={scrollPrev} aria-label="Depoimento anterior">
              <ArrowLeftCircle className="h-10 w-10 text-white/50 hover:text-white transition-colors" />
            </button>
            <button onClick={scrollNext} aria-label="Próximo depoimento">
              <ArrowRightCircle className="h-10 w-10 text-white/50 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
