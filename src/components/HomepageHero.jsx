// src/components/HomepageHero.jsx
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const HomepageHero = () => {
  const [cotacoes, setCotacoes] = useState(null);

  useEffect(() => {
    const carregarCotacoes = async () => {
      try {
        const res = await fetch('/api/cotacoes');
        const data = await res.json();
        setCotacoes(data);
      } catch (error) {
        console.error("Erro ao carregar cotações no frontend", error);
      }
    };
    carregarCotacoes();
  }, []);

  // Função para calcular os preços em Reais por peso
  const calcularPrecosBRL = (precoUsdOz) => {
    if (!precoUsdOz || !cotacoes?.dolar) return null;
    const ozToGrams = 31.1034768;
    const precoGramaUsd = precoUsdOz / ozToGrams;
    const precoGramaBrl = precoGramaUsd * cotacoes.dolar;

    return {
      g1: (precoGramaBrl * 1).toFixed(2),
      g10: (precoGramaBrl * 10).toFixed(2),
      g100: (precoGramaBrl * 100).toFixed(2),
      kg1: (precoGramaBrl * 1000).toFixed(2),
    };
  };

  // Função que gera o texto do balãozinho (Tooltip)
  const gerarTooltip = (precoUsdOz) => {
    const precos = calcularPrecosBRL(precoUsdOz);
    if (!precos) return "Calculando...";
    return `Valores em Reais (R$):\n1g: R$ ${precos.g1}\n10g: R$ ${precos.g10}\n100g: R$ ${precos.g100}\n1kg: R$ ${precos.kg1}`;
  };

  // Formatador para garantir 2 casas decimais na tela
  const formatarUS = (valor) => valor ? parseFloat(valor).toFixed(2) : '---';

  // Criamos um componente interno para os itens da cotação para facilitar a duplicação
  const CotacaoItems = () => (
    <div className="flex gap-12 px-6 items-center w-max">
      <span className="text-gray-300 font-medium text-sm">
        Dólar: <strong className="text-green-400">R$ {formatarUS(cotacoes?.dolar)}</strong>
      </span>
      
      <span 
        className="text-gray-300 font-medium text-sm cursor-help" 
        title={gerarTooltip(cotacoes?.ouro)}
      >
        Ouro: <strong className="text-[#d89900]">US$ {formatarUS(cotacoes?.ouro)} <span className="text-xs font-normal text-gray-500">/oz</span></strong>
      </span>
      
      <span 
        className="text-gray-300 font-medium text-sm cursor-help" 
        title={gerarTooltip(cotacoes?.prata)}
      >
        Prata: <strong className="text-gray-100">US$ {formatarUS(cotacoes?.prata)} <span className="text-xs font-normal text-gray-500">/oz</span></strong>
      </span>
      
      <span 
        className="text-gray-300 font-medium text-sm cursor-help" 
        title={gerarTooltip(cotacoes?.platina)}
      >
        Platina: <strong className="text-blue-200">US$ {formatarUS(cotacoes?.platina)} <span className="text-xs font-normal text-gray-500">/oz</span></strong>
      </span>
      
      <span 
        className="text-gray-300 font-medium text-sm cursor-help" 
        title={gerarTooltip(cotacoes?.paladio)}
      >
        Paládio: <strong className="text-purple-200">US$ {formatarUS(cotacoes?.paladio)} <span className="text-xs font-normal text-gray-500">/oz</span></strong>
      </span>

      {/* NOVO: Ródio adicionado aqui */}
      <span 
        className="text-gray-300 font-medium text-sm cursor-help" 
        title={gerarTooltip(cotacoes?.rodio)}
      >
        Ródio: <strong className="text-rose-200">US$ {formatarUS(cotacoes?.rodio)} <span className="text-xs font-normal text-gray-500">/oz</span></strong>
      </span>
    </div>
  );

  return (
    <section className="relative bg-black text-white text-center pt-0 pb-24 md:pb-40 overflow-hidden flex flex-col">
      
      {/* --- TICKER COLADO NO TOPO (Z-INDEX ALTO) --- */}
      <div className="w-full bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-md z-30">
        <div className="flex overflow-hidden py-2 relative">
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: flex;
              width: max-content;
              animation: marquee 50s linear infinite;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* O segredo do loop infinito: 2 blocos idênticos que deslizam 50% da largura total */}
          <div className="animate-marquee">
            <div className="flex">
              <CotacaoItems />
              <CotacaoItems />
              <CotacaoItems />
            </div>
            <div className="flex">
              <CotacaoItems />
              <CotacaoItems />
              <CotacaoItems />
            </div>
          </div>
        </div>
        
        {/* Observação discreta atualizada */}
        <div className="bg-black/80 py-1 px-4 flex justify-center items-center text-[10px] text-[#d89900] uppercase tracking-wider gap-4">
          <span>Atualizado 3x ao dia</span>
          <span>•</span>
          <span>Fonte: Mercado Financeiro</span>
        </div>
      </div>

      {/* Efeito de fundo com gradiente Dourado (Abaixo do Ticker) */}
      <div 
        className="absolute inset-0 mt-16 bg-[radial-gradient(ellipse_at_top,rgba(216,153,0,0.2)_0%,rgba(0,0,0,0)_60%)] z-0"
        aria-hidden="true"
      />
      
      {/* --- CONTEÚDO PRINCIPAL DO HERO --- */}
      <div className="relative z-10 container mx-auto px-4 pt-20 md:pt-32">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Transforme Sucata em Riqueza.
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          O portal completo para você dominar a recuperação de metais preciosos e construir um negócio lucrativo do zero.
        </p>

        <div className="flex justify-center items-center gap-4 flex-wrap">
          <Link 
            href="/mentoria"
            className="bg-[#d89900] text-black font-bold text-lg py-3 px-8 rounded-lg hover:bg-[#F7FA83] transition-colors"
          >
            Conheça a Mentoria
          </Link>
          <Link 
            href="/produtos"
            className="bg-zinc-800 text-white font-bold text-lg py-3 px-8 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
