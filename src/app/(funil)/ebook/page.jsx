// src/app/(funil)/ebook/page.jsx
"use client";

import { useState } from 'react';
import { getUtms } from '@/utils/utm';
import { trackLead } from '@/utils/tracking';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function EbookLandingPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'error'
  const router = useRouter();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Proteção anti-bot
    if (honeypot) return;

    setStatus('loading');
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          // ORIGEM ESPECÍFICA: Diferencia quem veio do anúncio (subdomínio) de quem veio da Home
          origem: 'Subdominio - Anuncio Ebook', 
          utms: getUtms(),
        }),
      });

      const data = await response.json();

      if (response.ok && (data.sucesso || data.success)) {
        trackLead('Isca Digital - Ebook (Subdominio)');
        // Redireciona para a página de obrigado
        router.push('/obrigado');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#d89900] selection:text-black font-sans">
      {/* HEADER SIMPLES (Apenas Logo, sem menu) */}
      <header className="w-full py-6 border-b border-zinc-900 flex justify-center">
        <Image 
          src="/logo_fundoTransparentered.png" 
          alt="Garimpo Urbano" 
          width="150" 
          height="50"
          className="w-auto h-auto"
          priority
        />
      </header>

      {/* HERO SECTION */}
      <section className="container mx-auto px-4 py-12 md:py-20 max-w-6xl flex flex-col md:flex-row items-center gap-12">
        
        {/* Lado Esquerdo: Copy e Mockup */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[#d89900] font-bold tracking-wider uppercase text-sm mb-4 border border-[#d89900] px-3 py-1 rounded-full">
            E-book Gratuito
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Como transformar lixo eletrônico em <span className="text-[#d89900]">OURO</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Descubra como equipamentos eletrônicos descartados todos os dias escondem 
            <strong> ouro, prata, paládio e platina</strong> - e como você pode começar a 
            extrair esse valor mesmo sem experiência.
          </p>
          
          <ul className="space-y-4 text-left text-gray-300 mb-10 w-full max-w-md">
            <li className="flex items-start gap-3">
              <span className="text-[#d89900] text-xl -mt-0.5">✔</span>
              <span><strong>Onde encontrar:</strong> As principais fontes de sucata rica em metais na sua cidade.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d89900] text-xl -mt-0.5">✔</span>
              <span><strong>Sem investimento:</strong> Como conseguir matéria-prima sem gastar dinheiro.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#d89900] text-xl -mt-0.5">✔</span>
              <span><strong>O método:</strong> Entenda o caminho desde a coleta até o refino do metal.</span>
            </li>
          </ul>
        </div>

        {/* Lado Direito: Formulário de Captura */}
        <div className="md:w-1/2 w-full max-w-md">
          <div className="bg-zinc-900 p-8 md:p-10 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* Efeito de brilho no fundo */}
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-transparent via-[#d89900] to-transparent"></div>
            
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              Baixe seu E-book Agora
            </h3>
            <p className="text-gray-400 text-center text-sm mb-8">
              Preencha os dados abaixo para receber o material completo no seu e--mail.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Seu primeiro nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors"
                  placeholder="Ex: João"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Seu melhor e-mail</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors"
                  placeholder="joao@email.com"
                />
              </div>

              {/* Honeypot anti-bot */}
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
                <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded">
                  Ocorreu um erro. Verifique seus dados e tente novamente.
                </p>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#d89900] text-black font-bold text-lg py-4 rounded-lg hover:bg-[#F7FA83] transition-colors disabled:opacity-70 mt-2 flex justify-center items-center shadow-[0_0_20px_rgba(216,153,0,0.3)] hover:shadow-[0_0_30px_rgba(216,153,0,0.5)]"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ) : (
                  "QUERO RECEBER O E-BOOK"
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                Suas informações estão 100% seguras.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLES */}
      <footer className="w-full py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm mt-auto">
        <p>© {new Date().getFullYear()} Mentoria Garimpo Urbano. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}