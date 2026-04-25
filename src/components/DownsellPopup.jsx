// src/components/DownsellPopup.jsx
"use client";

import Link from 'next/link';
import { X, AlertTriangle, Package } from 'lucide-react';

const DownsellPopup = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    // 1. Container Principal (O Fundo Escuro)    
    <div 
      className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      {/* 2. O Card do Popup */}
      <div 
        className="relative bg-gray-900 border border-yellow-500 rounded-2xl shadow-2xl shadow-yellow-500/20 p-8 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3. Botão de Fechar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
          aria-label="Fechar popup"
        >
          <X className="h-6 w-6" />
        </button>

        {/* 4. Conteúdo da Oferta de Downsell */}
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          
          <h2 className="text-3xl font-extrabold text-white mb-2">Espere, não vá ainda!</h2>
          <p className="text-lg text-gray-300 mb-6">
            O investimento no Curso Garimpo Urbano com Mentoria não é para você agora?
          </p>
          
          <div className="bg-black p-6 rounded-lg border border-gray-700">
            <p className="text-xl font-bold text-green-500 mb-2">OFERTA EXCLUSIVA:</p>
            <p className="text-lg text-white mb-4">
              Tenha acesso vitalício a <strong className="text-white">TODOS os 17 Módulos gravados</strong> do curso por um valor especial.
            </p>
            
            {/* Preço da Oferta de Downsell */}
            <div className="my-4">
              <p className="text-5xl font-bold text-white">
                R$997,00
              </p>
              <p className="text-gray-400">ou 12x de R$112,42</p>
            </div>

            {/* Botão de CTA para a nova oferta */}
            <Link 
              href="https://pay.hotmart.com/Y38962738S?off=mku66p4r&ref=J105438092D&bid=1777080674185" 
              className="block w-full bg-green-500 text-white font-bold text-xl py-4 px-6 rounded-lg hover:bg-green-600 transition-colors"
            >
              QUERO O CURSO AGORA!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownsellPopup;
