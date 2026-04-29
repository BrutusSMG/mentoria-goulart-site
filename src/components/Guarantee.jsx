// src/components/Guarantee.jsx
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react'; // Ícone de escudo para reforçar a segurança

const Guarantee = () => {
  return (
    <section className="bg-black py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Card de Garantia */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-2xl shadow-lg p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Coluna da Imagem (Selo) */}
            <div className="shrink-0 text-center">
              <Image
                src="/selo-garantia.png"
                alt="Selo de Garantia Incondicional de 7 dias"
                width={200}
                height={200}
                className="mx-auto"
              />
              <p className="text-[#d89900] font-bold mt-2">Garantia Blindada</p>
            </div>

            {/* Coluna do Texto */}
            <div className="border-t-2 md:border-t-0 md:border-l-2 border-gray-700 pt-8 md:pt-0 md:pl-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Seu Risco é <span className="text-[#d89900]">ZERO</span>. O Compromisso é Todo Meu.
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Eu tenho tanta confiança no método que desenvolvi que faço questão de assumir todo o risco por você.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-[#d89900] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">Garantia Incondicional de 7 Dias</h3>
                    <p className="text-gray-400">
                      Você tem 7 dias completos para acessar todo o curso, assistir às aulas e participar da comunidade. Se, por qualquer motivo, você sentir que não é para você, basta enviar um único e-mail.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg">
                  <ShieldCheck className="h-8 w-8 text-[#d89900] shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white">Reembolso de 100% do Valor</h3>
                    <p className="text-gray-400">
                      Devolveremos 100% do seu investimento, sem perguntas, sem burocracia e sem ressentimentos. Simples assim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
