// src/app/em-breve/page.jsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Clock, ArrowLeft, Mail } from 'lucide-react';

export default function EmBrevePage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Faz a chamada REAL para a nossa API centralizada
      const response = await fetch('/api/contato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origem: 'Lista de Espera - Em Breve', // Esse nome avisa a API para usar a Lista VIP
          email: email
        }),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        setEnviado(true);
        setEmail('');
      } else {
        console.error("Erro retornado pela API:", data.erro);
        alert("Ocorreu um erro ao cadastrar. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão. Verifique sua internet.");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-black px-4 py-20 relative overflow-hidden">
      {/* Efeito de luz dourada no fundo */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d89900] rounded-full blur-[120px] opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-zinc-900 p-4 rounded-full border border-zinc-800">
            <Clock className="w-12 h-12 text-[#d89900]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Conteúdo em <span className="text-[#d89900]">Lapidação</span>
        </h1>
        
        <p className="text-lg text-gray-400 mb-10 leading-relaxed">
          Estamos preparando um material incrível e de alto valor para você. 
          Este treinamento ou e-book estará disponível muito em breve na nossa plataforma.
        </p>

        {/* Formulário de Lista de Espera */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-sm mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            Quer ser avisado em primeira mão?
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Deixe seu e-mail abaixo e receba um aviso (e um desconto exclusivo) assim que lançarmos!
          </p>

          {enviado ? (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-lg font-medium">
              Tudo certo! Você está na nossa lista VIP. Avisaremos em breve.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu melhor e-mail"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-[#d89900] text-black font-bold py-3 px-6 rounded-lg hover:bg-[#b88200] transition-colors whitespace-nowrap"
              >
                Entrar na Lista VIP
              </button>
            </form>
          )}
        </div>

        {/* Botão Voltar */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
