// src/components/Mentoria/Hero.jsx

"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlayCircle, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoId = 'VY128RgvSzY';

  // EFEITO PRO: Trava a rolagem da página quando o vídeo está aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Limpeza caso o componente seja desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);
  
  return (
    <>
      <section className="bg-black text-white py-10 px-4 min-h-[90vh] flex flex-col justify-center">
        <div className="container mx-auto max-w-6xl">
          
          {/* Titulo Principal */}
          <h1 className="text-3xl md:text-5xl font-extrabold text-center leading-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 max-w-5xl mt-10 mb-12 mx-auto">
            Aprenda a extrair e refinar <span className="text-[#d89900]">Ouro</span>, <span className="text-[#C0C0C0]">Prata</span> e <span className="text-[#b1b1b1]">Paládio</span> de resíduos eletrônicos
            <span className="block text-xl md:text-1xl text-gray-400 mt-4 font-medium">
              Para ourives, técnicos e entusiastas que querem dominar uma habilidade técnica rara e transformar resíduos em matéria-prima valiosa.
            </span>
          </h1>

          {/* CONTAINER DAS DUAS COLUNAS (md:grid-cols-2 força as duas colunas em telas menores) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 max-w-1xl mx-auto">
            
            {/* COLUNA ESQUERDA (Textos) */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              
              {/* Vagas abertas para a mentoria */}
              <div className="inline-flex items-center gap-4 bg-[#d89900]/10 border border-[#d89900]/40 text-[#d89900] font-bold uppercase tracking-widest px-5 py-1.5 rounded-full text-xs md:text-sm mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(216,153,0,0.15)]">
    
                {/* Efeito de Bolinha Pulsante (Live Status) */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d89900] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d89900]"></span>
                </span>
                
                Vagas Abertas Para a Mentoria
              </div>
              
              {/* Imagem */}
              <Image
                src="/GUText.png"
                alt="Garimpo Urbano"
                width={500}
                height={90}
                className="h-auto w-full max-w-75 md:max-w-100 drop-shadow-lg mb-6"
                priority
              />
              
              {/* Subtitulo */}
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                Descubra o passo a passo seguro para recuperar <strong className="text-white">Ouro, Prata e Paládio</strong> de eletrônicos e peças automotivas. 
                Aprenda uma nova habilidade e comece do zero, trabalhando no seu próprio espaço.
              </p>
            </div>

            {/* COLUNA DIREITA (Vídeo) */}
            <div className="w-full">
              <div className="w-full aspect-video rounded-xl overflow-hidden relative border-2 border-gray-800 shadow-2xl shadow-[#d89900]/10 bg-gray-900/50">
                
                {/* MUDANÇA 1: Só mostra essa imagem se o modal estiver FECHADO (!isModalOpen) */}
                {!isModalOpen && (
                  <div onClick={() => setIsModalOpen(true)} className="cursor-pointer w-full h-full relative group">
                    <Image
                      src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="Apresentação do Método"
                      fill
                      className="object-cover z-10 transition-transform duration-700 group-hover:scale-105"
                      priority
                      sizes="(max-width: 768px ) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all z-0">
                      <div className="bg-[#d89900] rounded-full p-1 shadow-[0_0_30px_rgba(216,153,0,0.8)] group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle className="h-20 w-20 text-black" />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* PARTE INFERIOR (Centralizada) */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-col md:flex-row gap-4 md:gap-12 mb-8 text-gray-300 text-lg font-medium">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#d89900]" />
                <span>Método 100% Online e em Vídeo</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#d89900]" />
                <span>Não precisa de experiência prévia</span>
              </div>
            </div>

            {/* Botão CTA */}
            <div className="flex justify-center items-center gap-4 flex-wrap mt-8">
              <a 
                href="#oferta"
                onClick={(e) => {
                  e.preventDefault(); // Evita que a URL mude bruscamente
                  document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#d89900] text-black font-bold text-lg py-4 px-8 rounded-lg hover:bg-[#F7FA83] transition-colors inline-block"
              >
                QUERO GARANTIR MINHA VAGA AGORA!
              </a>

              <a 
                href="#depoimentos"
                onClick={(e) => {
                  e.preventDefault();
                  // Certifique-se de que a seção de vídeos tenha o id="depoimentos"
                  document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-transparent border border-zinc-600 text-white font-bold text-lg py-4 px-8 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Ver Depoimentos dos Alunos
              </a>
            </div>
            
            {/* Compra 100% Segura */}
            <div className="flex items-center gap-2 mt-4 mb-4 text-gray-400 text-sm">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span>Compra 100% Segura e Acesso Imediato via Hotmart</span>
            </div>

          </div>          
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL DO VÍDEO (Fica invisível até o usuário clicar) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-4 md:p-8"
          onClick={() => setIsModalOpen(false)} 
        >
          <div 
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(216,153,0,0.2)] border border-gray-800 animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-red-600 text-white rounded-full p-2 transition-colors border border-gray-700"
              aria-label="Fechar vídeo"
            >
              <X className="w-6 h-6" />
            </button>

            {/* MUDANÇA 2: Adicionado allow="autoplay" explícito para forçar o navegador a aceitar */}
            <iframe
              className="relative z-40 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="Player de vídeo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
       )}
    </>
  );
};

export default Hero;