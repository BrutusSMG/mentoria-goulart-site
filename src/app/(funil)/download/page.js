// src/app/download/page.js
"use client"; // Agora é um client component para podermos usar funções de clique

import { trackCompleteRegistration } from '@/utils/tracking';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

// Criamos um componente interno para usar o useSearchParams com segurança
function DownloadContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

   const handleDownloadClick = () => {
    trackCompleteRegistration();
    // A rota valida o leadId no banco e entrega o PDF
    window.open(`/api/ebook?leadId=${leadId || ''}`, '_blank');
  };


  return (
    <div className="max-w-2xl w-full bg-gray-900 p-8 md:p-12 rounded-2xl border border-green-500/30 text-center shadow-2xl shadow-green-500/10">
      <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
        Parabéns! Seu e-book está liberado.
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Clique no botão abaixo para baixar o PDF &quot;O Mapa do Tesouro&quot; e começar sua jornada no Garimpo Urbano.
      </p>

      {/* Botão que dispara a função de rastreio e abre o PDF */}
      <button 
        onClick={handleDownloadClick}
        className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl py-4 px-8 rounded-lg transition-transform hover:scale-105 mb-12 w-full md:w-auto"
      >
        <Download className="h-6 w-6" />
        BAIXAR O E-BOOK AGORA
      </button>

      <hr className="border-gray-800 mb-8" />

      <h2 className="text-2xl font-bold text-white mb-4">
        Quer acelerar seus resultados?
      </h2>
      <p className="text-gray-400 mb-6">
        Enquanto você lê o e-book, conheça a nossa Mentoria Completa, onde eu pego na sua mão e te ensino o passo a passo prático em vídeo-aulas.
      </p>
      <Link 
        href="/mentoria"
        className="inline-flex items-center justify-center gap-2 text-green-500 hover:text-green-400 font-bold text-lg transition-colors"
      >
        Conhecer a Mentoria Garimpo Urbano <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-black py-20 px-4 flex flex-col items-center justify-center">
      {/* Suspense é necessário no Next.js 14+ ao usar useSearchParams */}
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <DownloadContent />
      </Suspense>
    </main>
  );
}
