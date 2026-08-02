// src/app/(funil)/ebook/obrigado/page.jsx
import Link from 'next/link';
import { Mail, ArrowRight, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Pronto! Confira seu E-mail | Garimpo Urbano',
  robots: { index: false },
};

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen bg-black py-20 px-4 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-900 p-8 md:p-12 rounded-2xl border border-yellow-500/30 text-center shadow-2xl shadow-yellow-500/10">
        
        {/* Ícone animado */}
        <Mail className="h-20 w-20 text-yellow-500 mx-auto mb-6 animate-bounce" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Pronto! Seu e-book está a caminho 🎉
        </h1>

        <p className="text-lg text-gray-300 mb-6">
          O link exclusivo para baixar o seu e-book <strong>&quot;Como transformar lixo eletrônico em OURO&quot;</strong> acabou de ser enviado para o seu e-mail.
        </p>

        {/* Instruções */}
        <div className="bg-black/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" /> O que fazer agora?
          </h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-2 ml-2">
            <li>Abra o seu aplicativo de e-mail.</li>
            <li>Procure por um e-mail de <strong className="text-white">Prof. Goulart</strong>.</li>
            <li>Se não encontrar na caixa de entrada, <strong className="text-white">verifique a pasta de Spam ou Promoções</strong>.</li>
            <li>Abra o e-mail e clique no botão para baixar o PDF!</li>
          </ol>
        </div>

        {/* Gancho para o funil de e-mails */}
        <div className="bg-black/50 border border-[#d89900]/30 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-[#d89900] font-bold mb-2 flex items-center gap-2">
            ⚡ Fique de olho na sua caixa de entrada!
          </h3>
          <p className="text-gray-300">
            Nos próximos dias, vou te enviar um <strong className="text-white">Capítulo Extra exclusivo</strong> direto no seu e-mail com informações que não estão no e-book. Não perca!
          </p>
        </div>

        <hr className="border-gray-800 mb-8" />

        {/* Upsell Estratégico */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Enquanto o e-mail chega...
        </h2>
        <p className="text-gray-400 mb-6">
          Que tal conhecer a Mentoria Completa onde eu te ensino, na prática e em vídeo, como extrair ouro, prata e platina de sucata eletrônica?
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
