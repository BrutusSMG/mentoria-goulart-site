// src/components/Learning.jsx
import { FlaskConical, Gem, Warehouse, ShieldCheck, Beaker, Truck, Flame, Droplets, BarChart3, Recycle, Car, Film, Watch, Cpu, Sparkles } from 'lucide-react';

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
];

const Learning = () => {
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

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningModules.map((module, index) => (
            <div key={index} className="bg-gray-700/80 p-6 rounded-lg border border-gray-800 flex items-start gap-5">
              {/* Ícone */}
              <div className="text-green-500 mt-1">
                {React.cloneElement(module.icon, { className: "h-8 w-8" })}
              </div>
              {/* Conteúdo */}
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{module.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{module.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
export default Learning;
