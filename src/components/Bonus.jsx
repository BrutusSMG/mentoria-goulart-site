// src/components/Bonus.jsx
import React from 'react';
import { BookMarked, GraduationCap, Rocket } from 'lucide-react';
import { Gift } from 'lucide-react'; 

// 1. Estrutura de dados com título, descrição, valor e ícone
const bonusData = [
  {
    title: "Livro Digital Garimpo Urbano",
    description: "Um guia completo com as técnicas de recuperação de ouro, prata, paládio, platina e ródio de sucatas e resíduos.",
    value: "198,00",
    icon: <BookMarked />
  },
  {
    title: "Acesso ao meu TCC em Processos Metalúrgicos",
    description: "Meu trabalho de conclusão de curso, detalhando a extração hidro e pirometalúrgica de metais preciosos.",
    value: "147,00",
    icon: <GraduationCap />
  },
  {
    title: "Curso Empreendedor 4.0",
    description: "Uma formação com 12 aulas focadas em estratégias de negócio para você lucrar de verdade.",
    value: "247,00",
    icon: <Rocket />
  }
];

// Calculando o valor total dos bônus
const totalValue = bonusData.reduce((sum, item) => sum + parseFloat(item.value.replace(',', '.')), 0);

const Bonus = () => {
  return (
    <section className="bg-black py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          {/* Título Principal */}
          <h2 className="text-4xl md:text-5xl font-extrabold text-white flex flex-col items-center gap-3">
            <span>E para garantir o seu sucesso...</span>
            <span className="text-yellow-400">Este é o meu presente para você:</span>
          </h2>

          {/* Ícone de Presente */}
          <div className="my-6">
            <Gift className="h-16 w-16 text-yellow-400 mx-auto animate-bounce" />
          </div>

          {/* Subtítulo de Valor */}
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Eu preparei 3 bônus especiais que vão acelerar seus resultados. Eles são seus, <strong className="text-green-500">totalmente de graça</strong>, ao entrar para a mentoria hoje.
          </p>
        </div>

        {/* Grid de Bônus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {bonusData.map((bonus, index) => (
            // Card do Bônus
            <div key={index} className="bg-gray-900/80 border-2 border-dashed border-yellow-400/50 rounded-lg p-6 text-center flex flex-col items-center shadow-lg hover:border-yellow-400 transition-all">
              <div className="text-yellow-400 mb-4">
                {React.cloneElement(bonus.icon, { className: "h-12 w-12" })}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{bonus.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed grow mb-4">{bonus.description}</p>
              <div className="mt-auto">
                <span className="text-gray-500 line-through">De R${bonus.value}</span>
                <p className="text-green-500 font-bold text-2xl">Por R$0,00</p>
              </div>
            </div>
          ))}
        </div>

        {/* Valor Total Economizado */}
        <div className="text-center mt-16">
          <div className="inline-block bg-yellow-400/10 border border-yellow-500 text-white p-6 rounded-lg">
            <p className="text-xl">Ao todo, você <strong className="text-yellow-400">economiza R${totalValue.toFixed(2).replace('.', ',')}</strong> só com os bônus!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bonus;
