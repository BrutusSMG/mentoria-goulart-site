// src/components/mentoria/Offer.jsx
"use client";

import { trackInitiateCheckout } from '@/utils/tracking';
import Link from 'next/link';
import { Check, Package, BookMarked, GraduationCap, Rocket } from 'lucide-react';

// Vamos reutilizar os dados dos bônus para calcular o valor total
const bonusValue = 198 + 147 + 247; // R$592
const courseValue = 4997;
const totalValue = courseValue + bonusValue;
const discountedValue = 2497;

const Offer = () => {
  return (
    <section id="oferta" className="bg-[#171f35] py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        
        {/* Card de Oferta Principal */}
        <div className="bg-gray-900 border-2 border-[#d89900] rounded-2xl shadow-2xl shadow-[#d89900]/20 p-6 md:p-10 mx-auto">

          {/* Título da Oferta */}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Sua Vaga na Mentoria Garimpo Urbano
          </h2>
          <p className="text-yellow-400 font-semibold mb-8">OFERTA ESPECIAL DE LANÇAMENTO</p>

          {/* Lista de Entregáveis (O que o aluno leva) */}
          <div className="text-left max-w-md mx-auto space-y-4 mb-10">
            <p className="flex items-start gap-3 text-lg">
              <Check className="h-6 w-6 text-green-500 shrink-0 mt-1" />
              <span>1 ano de acesso completo aos <strong className="text-white">Módulos do Curso</strong></span>
            </p>            
            <p className="flex items-start gap-3 text-lg">
              <Check className="h-6 w-6 text-green-500 shrink-0 mt-1" />
              <span>Acesso à <strong className="text-white">Comunidade VIP</strong> de alunos</span>
            </p>
            <p className="flex items-center gap-3 text-lg text-yellow-400">
              <Package className="h-6 w-6 shrink-0 mt-1" /> 
              <span><strong className="text-white">Pacote de Bônus Exclusivos</strong></span>
            </p>           
          </div>

          {/* Bloco de Preço */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="text-gray-400">Valor total do pacote: </span>
              <span className="text-red-500 line-through text-xl">R${totalValue.toFixed(2).replace('.', ',')}</span>
            </div>
            <p className="text-lg text-white mb-2">
              Hoje, por apenas 12x de
            </p>
            <p className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-green-500 animate-pulse">
              R$281,57
            </p>
            <p className="text-lg text-white mt-2">
              ou {discountedValue.toFixed(2).replace('.', ',')} à vista
            </p>
          </div>

          {/* Botão de CTA */}
          <div className="mt-10">
            <Link 
              href="https://go.hotmart.com/J105438092D?dp=1"
              onClick={() => trackInitiateCheckout('Curso + Mentoria', 2497)}
              className="bg-[#d89900] text-white font-bold text-2xl md:text-3xl py-5 px-8 rounded-lg shadow-lg shadow-[#d89900]/50 hover:bg-[#c68a00] hover:scale-105 transition-all duration-300 ease-in-out inline-block"
            >
              SIM, QUERO GARANTIR MINHA VAGA AGORA!
            </Link>
          </div>

          {/* Gatilho de Urgência */}
          <p className="text-gray-500 text-sm mt-8">
            ⚠️ Vagas limitadas. Esta oferta pode encerrar a qualquer momento.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Offer;
