// src/components/mentoria/SecondaryPromise.jsx

import Image from 'next/image';
import { Cpu, Car, Gem, Recycle, PlaySquare, MessageCircle, BookOpen, Award, Sparkles } from 'lucide-react';

const SecondaryPromise = () => {
  // Dados dos Materiais (Com as tags de metal de volta)
  const materials = [
    {
      icon: <Cpu className="w-8 h-8 text-[#d89900]" />,
      title: "Resíduos Eletrônicos",
      metal: "Rende Ouro e Prata",
      metalColor: "text-[#d89900] bg-[#d89900]/10 border-[#d89900]/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(216,153,0,0.15)]",
      description: "Placas de celulares, computadores e memórias RAM que são descartadas aos montes todos os dias.",
    },
    {
      icon: <Car className="w-8 h-8 text-[#C0C0C0]" />,
      title: "Catalisadores Automotivos",
      metal: "Rende Paládio e Platina",
      metalColor: "text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(192,192,192,0.15)]",
      description: "Peças de escapamento velhas que escondem metais valiosos como Platina e Paládio.",
    },
    {
      icon: <Gem className="w-8 h-8 text-[#d89900]" />,
      title: "Resíduos de Joalheria",
      metal: "Rende Ouro Puro",
      metalColor: "text-[#d89900] bg-[#d89900]/10 border-[#d89900]/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(216,153,0,0.15)]",
      description: "Pó de ourives, limalhas e peças quebradas que podem ser purificadas e reaproveitadas.",
    },
    {
      icon: <Recycle className="w-8 h-8 text-[#C0C0C0]" />,
      title: "Radiografias Antigas",
      metal: "Rende Prata Pura",
      metalColor: "text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(192,192,192,0.15)]",
      description: "Chapas de Raio-X velhas que possuem uma quantidade surpreendente de Prata pura escondida.",
    }
  ];

  // Dados dos Benefícios
  const benefits = [
    {
      icon: <Award className="w-7 h-7 text-[#d89900]" />,
      title: "Conhecimento de Qualidade",
      description: "O método validado pelos mais de 30 anos de experiência prática do Prof. Goulart."
    },
    {
      icon: <PlaySquare className="w-7 h-7 text-[#d89900]" />,
      title: "Aprenda no seu ritmo",
      description: "Siga um passo a passo detalhado em vídeo e avance no seu próprio tempo, revendo as técnicas sempre que precisar."
    },
    {
      icon: <MessageCircle className="w-7 h-7 text-[#d89900]" />,
      title: "Suporte Direto",
      description: "Tire dúvidas diretamente com o Prof. Goulart e com outros alunos praticantes."
    },
    {
      icon: <BookOpen className="w-7 h-7 text-[#d89900]" />,
      title: "Guias Práticos",
      description: "Receba materiais de apoio que você consulta direto na sua bancada de trabalho."
    },    

  ];

  return (
    <section className="bg-zinc-950 text-white py-20 px-4 relative overflow-hidden">
      
      {/* Efeito de luz de fundo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#d89900]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* ========================================================= */}
        {/* 1. SEÇÃO DE DOR E IDENTIFICAÇÃO (Perguntas Retóricas) */}
        {/* ========================================================= */}
        <div className="max-w-6xl mx-auto mb-16">
          
          {/* Trocamos lg: por md: para forçar o lado a lado em notebooks e tablets */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Coluna da Esquerda: A Copy (Texto) */}
            <div className="md:w-1/2 text-center md:text-left">
              <span className="text-[#d89900] font-bold tracking-wider uppercase text-sm mb-3 block">
                O Fim da Confusão
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4 leading-relaxed">
                Você já tentou aprender sobre recuperação de metais e se perdeu em tutoriais incompletos?
              </h2>
              <h3 className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed">
                Sente que existe um mercado promissor, mas falta o <strong className="text-[#d89900]">conhecimento técnico correto</strong> para começar com segurança e sem desperdiçar material?
              </h3>
            </div>

            {/* Coluna da Direita: A Imagem com Vinheta */}
            <div className="md:w-1/2 w-full max-w-md mx-auto relative group">
              
              {/* Efeito de brilho (Glow) atrás da imagem */}
              <div className="absolute inset-0 bg-[#d89900]/10 blur-2xl rounded-2xl group-hover:bg-[#d89900]/20 transition-colors duration-500"></div>
              
              {/* Container da Imagem + Camada de Vinheta */}
              <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden">
                
                <Image 
                  src="/image1.png" 
                  alt="Dificuldade no aprendizado de refino" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-cover block"
                  style={{ width: '100%', height: 'auto' }}
                />

                {/* A Vinheta Escura (Usando style para controle total) */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 10%, rgba(9,9,11,0.95) 75%)'
                  }}
                ></div>
                
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. A OPORTUNIDADE (Grid de 2 colunas com Tags de Metal) */}
        {/* ========================================================= */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
              A matéria-prima já está ao seu redor.
            </h3>
            <p className="text-gray-400 text-lg">Você só precisa do método certo para extrair o valor oculto de:</p>
          </div>

          {/* MUDANÇA AQUI: md:grid-cols-2 para forçar 2 colunas no desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {materials.map((item, index) => (
              <div 
                key={index} 
                className={`relative bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl transition-all duration-500 group hover:-translate-y-2 ${item.glow}`}
              >
                {/* Tag Visual do Metal */}
                <div className={`absolute -top-3 right-6 px-4 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 backdrop-blur-md ${item.metalColor}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {item.metal}
                </div>

                <div className="bg-black/60 w-14 h-14 rounded-xl flex items-center justify-center mb-6 border border-zinc-700 group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-100 mb-3">{item.title}</h4>
                <p className="text-gray-400 text-base leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. SEÇÃO DE BENEFÍCIOS (Orientados a Resultado) */}
        {/* ========================================================= */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold">
              Como a Mentoria resolve esse problema:
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-5">
                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-100 mb-2">{benefit.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SecondaryPromise;
