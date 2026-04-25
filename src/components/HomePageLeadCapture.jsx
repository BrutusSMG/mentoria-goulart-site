// src/components/HomePageLeadCapture.jsx
"use client";

import { useState } from 'react';

const HomePageLeadCapture = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Aqui você integrará com sua ferramenta de e-mail marketing (ActiveCampaign, Mailchimp, etc.)
    console.log("Lead capturado:", email);
    alert("E-book enviado para o seu e-mail!");
    setEmail('');
  };

  return (
    <section className="bg-zinc-900 py-20 px-4 border-t border-zinc-800">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-10">
        
        {/* Lado Esquerdo: Texto */}
        <div className="md:w-1/2 text-center md:text-left">
          <span className="text-[#d89900] font-bold tracking-wider uppercase text-sm mb-2 block">
            Material 100% Gratuito
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Comece por aqui: Recupere Ouro e Prata de Resíduos
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Baixe nosso e-book gratuito e descubra o passo a passo inicial para extrair valor de resíduos de oficinas de joias. O conhecimento que você precisa para dar o primeiro passo no Garimpo Urbano.
          </p>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="md:w-1/2 w-full bg-black p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Para onde devemos enviar seu E-book?
          </h3>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Digite seu melhor e-mail" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <button 
              type="submit"
              className="w-full bg-[#d89900] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#F7FA83] transition-colors"
            >
              Quero Receber o E-book Grátis
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Fique tranquilo, nós odiamos spam. Seus dados estão seguros.
            </p>
          </form>
        </div>

      </div>
    </section>
  );
};

export default HomePageLeadCapture;
