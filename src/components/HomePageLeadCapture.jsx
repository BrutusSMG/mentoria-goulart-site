// src/components/HomePageLeadCapture.jsx
"use client";

import { getUtms } from '@/utils/utm';
import { useState } from 'react';
import { trackLead } from '@/utils/tracking';

const HomePageLeadCapture = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Fluxo unificado: /api/leads salva no banco, envia o e-book
      // por e-mail (Resend) e registra na lista do Brevo.
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
          origem: 'Isca Digital - Ebook', // Essa origem avisa a API para usar a lista do E-book
          utms: getUtms(),
        }),
      });

      const data = await response.json();

      if (response.ok && (data.sucesso || data.success)) {
        trackLead('Isca Digital - Ebook (newsletter)');
        setStatus('success');
        setEmail('');
      } else {
        console.error("Erro retornado pela API:", data.erro);
        setStatus('error');
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setStatus('error');
    }
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

        {/* Lado Direito: Formulário ou Mensagem de Sucesso */}
        <div className="md:w-1/2 w-full bg-black p-8 rounded-2xl border border-zinc-800 shadow-2xl min-h-75 flex flex-col justify-center">
          
          {status === 'success' ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-[#d89900]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">E-book Enviado!</h3>
              <p className="text-gray-400">
                Verifique sua caixa de entrada (e a pasta de spam/promoções). O material já está a caminho.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 text-[#d89900] hover:text-white underline text-sm transition-colors"
              >
                Baixar com outro e-mail
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Para onde devemos enviar seu E-book?
              </h3>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Seu primeiro nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors disabled:opacity-50"
                />

                <input 
                  type="email" 
                  placeholder="Digite seu melhor e-mail" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors disabled:opacity-50"
                />

                <input
                  type="text"
                  name="telefone_secundario"
                  tabIndex="-1"
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  onChange={(e) => setHoneypot(e.target.value)}
                />
                
                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center">
                    Ocorreu um erro ao enviar. Tente novamente.
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#d89900] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#F7FA83] transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {status === 'loading' ? (
                    <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   ) : (
                    "Quero Receber o E-book Grátis"
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Fique tranquilo, nós odiamos spam. Seus dados estão seguros.
                </p>
              </form>
            </>
          )}
        </div>

      </div>
    </section>
  );
};

export default HomePageLeadCapture;
