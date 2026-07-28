// src/app/quase-la/page.js
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Mail, ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Falta só um passo! | Garimpo Urbano',
  robots: 'noindex, nofollow',
};

export default function QuaseLaPage() {
  return (
    <main className="min-h-screen bg-black py-20 px-4 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-900 p-8 md:p-12 rounded-2xl border border-yellow-500/30 text-center shadow-2xl shadow-yellow-500/10">
        
        <Mail className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce" />
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Falta só um passo!
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          O link para baixar o seu e-book <strong>&quot;O Mapa do Tesouro&quot;</strong> acabou de ser enviado para o seu e-mail.
        </p>

        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" /> O que fazer agora?
          </h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-2 ml-2">
            <li>Abra o seu aplicativo de e-mail.</li>
            <li>Procure por um e-mail de <strong>José Goulart</strong>.</li>
            <li>Se não encontrar na caixa de entrada, <strong>verifique a pasta de Spam ou Promoções</strong>.</li>
            <li>Abra o e-mail e clique no link para baixar o PDF!</li>
          </ol>
        </div>

        <hr className="border-gray-800 mb-8" />

        {/* Upsell Estratégico */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Enquanto o e-mail chega...
        </h2>
        <p className="text-gray-400 mb-6">
          Que tal conhecer a Mentoria Completa onde eu te ensino na prática, em vídeo, tudo o que você vai ler no e-book?
        </p>
        <Link 
          href="/mentoria"
          className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-black font-bold text-lg py-4 px-8 rounded-lg transition-transform hover:scale-105"
        >
          Conhecer a Mentoria Garimpo Urbano <ArrowRight className="h-5 w-5" />
        </Link>

      </div>
    </main>
  );
}
