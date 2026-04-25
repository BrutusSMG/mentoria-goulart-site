// src/components/HomepageHero.jsx
"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const HomepageHero = () => {
  const tradingViewWidgetRef = useRef(null);

  useEffect(() => {
    const widgetContainer = tradingViewWidgetRef.current;

    // Se o container não existe ou já tem o widget, não faz nada.
    if (!widgetContainer || widgetContainer.hasChildNodes()) {
      return;
    }

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "description": "Ouro (BRL/g )", "proName": "BMFBOVESPA:GLD1!" },
        { "description": "Prata (USD/Oz)", "proName": "OANDA:XAGUSD" },
        { "description": "Platina (USD/Oz)", "proName": "TVC:PLATINUM" },
        { "description": "Paládio (USD/Oz)", "proName": "TVC:PALLADIUM" },
        { "description": "Dólar (BRL)", "proName": "FX_IDC:USDBRL" }
      ],
      "showSymbolLogo": true,
      "colorTheme": "dark",
      "isTransparent": true,
      "displayMode": "adaptive",
      "locale": "br"
    });

    widgetContainer.appendChild(script);

    // Função de limpeza para remover o script quando o componente for desmontado
    return () => {
      if (widgetContainer && widgetContainer.contains(script)) {
        widgetContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="relative bg-black text-white text-center py-24 md:py-40 px-4 overflow-hidden">
      {/* Efeito de fundo com gradiente */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,153,0,0.3)_0%,rgba(0,0,0,0)_60%)]"
        aria-hidden="true"
      />
      
      <div className="relative z-10 container mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Transforme Sucata em Riqueza.
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          O portal completo para você dominar a recuperação de metais preciosos e construir um negócio lucrativo do zero.
        </p>

        {/* --- WIDGET DE COTAÇÕES POSICIONADO AQUI --- */}
        <div className="w-full max-w-4xl mx-auto my-12 min-h-11.5">
          <div ref={tradingViewWidgetRef} className="tradingview-widget-container h-full"></div>
        </div>

        <div className="flex justify-center items-center gap-4 flex-wrap">
          <Link 
            href="/mentoria"
            className="bg-[#d89900] text-black font-bold text-lg py-3 px-8 rounded-lg hover:bg-[#F7FA83] transition-transform hover:scale-105"
          >
            Conheça a Mentoria
          </Link>
          <Link 
            href="#produtos"
            className="bg-gray-700 text-white font-bold text-lg py-3 px-8 rounded-lg hover:bg-gray-600 transition-transform hover:scale-105"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomepageHero;
