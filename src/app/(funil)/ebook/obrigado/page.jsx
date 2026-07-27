import Link from 'next/link';

export default function ObrigadoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-[#d89900] selection:text-black">
      
      <div className="max-w-2xl w-full bg-zinc-900 p-10 rounded-2xl border border-zinc-800 shadow-2xl text-center">
        
        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 bg-[#d89900]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cadastro Confirmado!
        </h1>
        
        <p className="text-gray-400 text-lg mb-8">
          Seu e-book <strong>&quot;O Maior Garimpo do Século XXI&quot;</strong> já está liberado. Clique no botão abaixo para fazer o download agora mesmo.
        </p>

        {/* Botão de Download Direto */}
        <a 
          href="/caminho-do-seu-arquivo/ebook-garimpo-urbano.pdf" 
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full md:w-auto px-8 py-4 bg-[#d89900] text-black font-bold text-lg rounded-lg hover:bg-[#F7FA83] transition-colors mb-10"
        >
          📥 BAIXAR MEU E-BOOK AGORA
        </a>

        {/* O Gancho para o Funil de E-mails (A Isca para a Mentoria) */}
        <div className="bg-black p-6 rounded-xl border border-zinc-800 text-left">
          <h3 className="text-[#d89900] font-bold text-xl mb-2 flex items-center gap-2">
            ⚠️ ATENÇÃO: O próximo passo...
          </h3>
          <p className="text-gray-300">
            Nos próximos dias, eu vou te enviar um <strong>Capítulo Extra exclusivo</strong> direto no seu e-mail. Nele, vou revelar <em>&quot;A oportunidade que poucos enxergam&quot;</em> no Garimpo Urbano. 
          </p>
          <p className="text-gray-400 text-sm mt-3">
            Fique de olho na sua caixa de entrada (e na pasta de spam/promoções) para não perder.
          </p>
        </div>

      </div>
    </main>
  );
}
