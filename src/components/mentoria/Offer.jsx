// src/components/mentoria/Offer.jsx
"use client";

import { useEffect, useState } from 'react';
import { Check, Package } from 'lucide-react';
import { trackInitiateCheckout } from '@/utils/tracking';
import { captureUtms, getUtms } from '@/utils/utm';

const HOTMART_CHECKOUT_URL = 'https://go.hotmart.com/J105438092D?dp=1&src=brevo-email-5';

function montarCheckoutComUtms( ) {
  const url = new URL(HOTMART_CHECKOUT_URL);
  const utms = getUtms();

  Object.entries(utms).forEach(([chave, valor]) => {
    if (valor) url.searchParams.set(chave, valor);
  });

  return url.toString();
}

const Offer = () => {

  function handleCheckout(event) {
    event.preventDefault();

    // Garante a captura da origem atual antes de sair do site.
    captureUtms();

    // Dispara o evento Meta antes da navegação para a Hotmart.
    trackInitiateCheckout('Curso Garimpo Urbano com Mentoria', 2497);

    // Leva para a Hotmart com UTM + src, sem expor o e-mail do Lead.
    window.location.assign(montarCheckoutComUtms());
  }

  return (
    <section id="oferta" className="bg-[#171f35] px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mx-auto rounded-2xl border-2 border-[#d89900] bg-gray-900 p-6 shadow-2xl shadow-[#d89900]/20 md:p-10">
          <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
            Acesso à Mentoria Garimpo Urbano
          </h2>

          <p className="mb-8 text-zinc-300">
            Uma trilha de aprendizagem progressiva para quem quer estudar recuperação de metais preciosos com mais clareza, orientação e responsabilidade.
          </p>

          <div className="mx-auto mb-10 max-w-md space-y-4 text-left">
            <p className="flex items-start gap-3 text-lg">
              <Check className="mt-1 h-6 w-6 shrink-0 text-green-500" />
              <span>1 ano de acesso aos <strong className="text-white">módulos do curso</strong></span>
            </p>
            <p className="flex items-start gap-3 text-lg">
              <Check className="mt-1 h-6 w-6 shrink-0 text-green-500" />
              <span>Acesso à <strong className="text-white">comunidade de alunos</strong></span>
            </p>
            <p className="flex items-start gap-3 text-lg">
              <Package className="mt-1 h-6 w-6 shrink-0 text-[#d89900]" />
              <span><strong className="text-white">Materiais complementares</strong> incluídos na proposta</span>
            </p>
          </div>

          <div className="mb-8">
            <p className="mb-2 text-lg text-white">Investimento</p>
            <p className="text-5xl font-extrabold text-green-500 sm:text-7xl md:text-8xl">
              12x de R$258,25
            </p>
            <p className="mt-2 text-lg text-white">ou R$2.497,00 à vista</p>
          </div>

          <div className="mt-10">
            <a
              href={HOTMART_CHECKOUT_URL}
              onClick={handleCheckout}
              className="inline-block rounded-lg bg-[#d89900] px-8 py-5 text-2xl font-bold text-black shadow-lg shadow-[#d89900]/50 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#F7FA83] md:text-3xl"
            >
              QUERO ENTRAR NA MENTORIA
            </a>
          </div>

          <p className="mt-6 text-sm text-zinc-400">
            Compra processada pela Hotmart. Você conta com garantia de 7 dias, conforme as condições apresentadas no checkout.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Offer;