// src/components/mentoria/Learning.jsx

"use client"; // Necessário para usar o useState

import React, { useState } from 'react';
import { FlaskConical, Gem, Warehouse, ShieldCheck, Beaker, Truck, Flame, Droplets, BarChart3, Recycle, Car, Film, Watch, Cpu, Sparkles, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Array com os dados dos módulos (refinados)
const learningModules = [
  { icon: <BarChart3 />, title: "Módulo 01: Visão Geral", description: "Uma introdução completa ao treinamento e à jornada que você irá percorrer." },
  { icon: <FlaskConical />, title: "Módulo 02: Metalurgia Nobre", description: "Aprenda a diferença entre lixo e resíduo industrial e conheça as principais rotas metalúrgicas." },
  { icon: <Gem />, title: "Módulo 03: Ligas na Indústria de Joias", description: "Entenda a composição dos metais e suas ligas usados na fabricação de joias." },
  { icon: <Warehouse />, title: "Módulo 04: Boas Práticas e Segurança", description: "Como recolher, armazenar e proteger seus resíduos para maximizar a apuração." },
  { icon: <ShieldCheck />, title: "Módulo 05: Saúde e Segurança", description: "Garanta sua integridade física e saúde com as melhores práticas de segurança laboratorial." },
  { icon: <Beaker />, title: "Módulo 06: Montando seu Laboratório", description: "Descubra quais equipamentos e produtos químicos são essenciais para começar." },
  { icon: <Truck />, title: "Módulo 07: Coleta e Transporte", description: "Aprenda o método correto para coletar e transportar resíduos de forma segura e eficiente." },
  { icon: <Flame />, title: "Módulo 08: Preparo e Descontaminação", description: "Domine as etapas cruciais: queima, separação magnética, moagem e descontaminação." },
  { icon: <Flame />, title: "Módulo 09: Rota Pirometalúrgica", description: "Aprenda a extrair e refinar metais preciosos usando a técnica de fusão em fornos." },
  { icon: <Droplets />, title: "Módulo 10: Rota Hidrometalúrgica", description: "Domine a extração e o refino de metais usando apenas reagentes líquidos." },
  { icon: <Sparkles />, title: "Módulo 11: Refino de Ligas e Joias", description: "Como purificar barras de metal ou joias velhas para obter o máximo de valor." },
  { icon: <Recycle />, title: "Módulo 12: Tratamento de Resíduos", description: "Aprenda a neutralizar, precipitar e descartar os resíduos do processo de forma segura." },
  { icon: <Car />, title: "Módulo 13: Metais de Catalisadores", description: "Guia completo para extrair Paládio, Platina e Ródio de catalisadores de automóveis." },
  { icon: <Film />, title: "Módulo 14: Prata de Radiografias", description: "Aprenda o processo específico para recuperar prata de filmes de raios-X." },
  { icon: <Watch />, title: "Módulo 15: Prata de Baterias", description: "Descubra como extrair prata de baterias de relógios, uma fonte muitas vezes ignorada." },
  { icon: <Cpu />, title: "Módulo 16: Metais de Eletrônicos", description: "O passo a passo para recuperar metais preciosos de contatos eletrônicos e placas de circuito." },
  { icon: <Gem />, title: "Módulo 17: Ouro de Semijoias", description: "Aprenda a técnica para extrair e refinar ouro de semijoias e caixas de relógios." },
  { icon: <PlusCircle />, title: "Módulos Extras: Atualizações Contínuas", description: "O mercado evolui e o curso também. Tenha acesso a novas aulas, técnicas avançadas e estudos de caso adicionados regularmente durante o seu acesso." },
];

const Learning = () => {
  // Estado para controlar se mostra todos ou apenas alguns
  const [showAll, setShowAll] = useState(false);
  
  // Quantidade de módulos para mostrar inicialmente (6 = 2 linhas no PC, 6 no celular)
  const initialCount = 6;
  
  // Filtra os módulos baseados no estado
  const visibleModules = showAll ? learningModules : learningModules.slice(0, initialCount);

  return (
    <section className="bg-[#171f35] py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            O Que Você Vai Aprender na Prática?
          </h2>
          <p className="text-lg text-gray-400 mt-3 max-w-3xl mx-auto">
            O treinamento está dividido em <strong className="text-white">17 módulos principais</strong>, além das aulas e mentorias ao vivo, cobrindo do absoluto zero ao refino avançado.
          </p>
        </div>

        {/* Container Relativo para o Efeito de Degradê */}
        <div className="relative">
          
          {/* Grid de Módulos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleModules.map((module, index) => (
              <div key={index} className="bg-gray-700/80 p-6 rounded-lg border border-gray-800 flex items-start gap-5 hover:border-[#d89900]/50 transition-colors duration-300">
                <div className="text-[#d89900] mt-1 shrink-0">
                  {React.cloneElement(module.icon, { className: "h-8 w-8" })}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">{module.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Efeito de Esmaecimento (Fade Out) - Só aparece se estiver fechado */}
          {!showAll && (
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#171f35] to-transparent pointer-events-none"></div>
          )}
        </div>

        {/* Botão de Ver Mais / Ver Menos */}
        <div className="mt-10 flex justify-center relative z-10">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 bg-transparent border-2 border-[#d89900] text-[#d89900] hover:bg-[#d89900] hover:text-black font-bold py-3 px-8 rounded-full transition-all duration-300"
          >
            {showAll ? (
              <>
                Mostrar Menos <ChevronUp className="w-5 h-5" />
              </>
            ) : (
              <>
                Ver Todos os {learningModules.length} Módulos <ChevronDown className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
};

export default Learning;