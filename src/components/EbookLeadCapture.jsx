//import EbookLeadCapture from '@/components/EbookLeadCapture'; // Seu componente atualizado com o Nome

export default function EbookLandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 selection:bg-[#d89900] selection:text-black">
      
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12 py-12">
        
        {/* Lado Esquerdo: Copy e Promessa */}
        <div className="md:w-1/2 text-center md:text-left">
          <span className="text-[#d89900] font-bold tracking-wider uppercase text-sm mb-3 block">
            E-book 100% Gratuito
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            O Maior Garimpo do Século XXI Não Está nas Montanhas...
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Descubra como extrair Ouro, Prata e outros Metais Preciosos de resíduos eletrônicos e industriais. O passo a passo inicial do Professor Goulart para você começar do zero.
          </p>
          
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 text-left">
            <h3 className="text-white font-semibold mb-4">Neste material você vai descobrir:</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#d89900]">✔</span>
                <span>Onde o ouro está escondido na sua cidade.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d89900]">✔</span>
                <span>Por que esse é um dos mercados mais lucrativos hoje.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d89900]">✔</span>
                <span>Os materiais básicos para começar com segurança.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lado Direito: O seu componente de formulário */}
        <div className="md:w-1/2 w-full">
          {/* Aqui entra o seu componente que faz o POST para a API e o router.push('/obrigado') */}
          {/* <EbookLeadCapture />  */}
          <p className="text-gray-400">Formulário em manutenção.</p>
        </div>

      </div>
    </main>
  );
}
