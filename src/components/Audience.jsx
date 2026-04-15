// src/components/Audience.jsx
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

// 1. Atualizamos o conteúdo com os novos textos persuasivos
const audienceItems = [
  {
    title: "Para o Iniciante Absoluto",
    description: "Que busca uma fonte de renda sólida e quer começar com segurança, sem arriscar seu dinheiro com achismos."
  },
  {
    title: "Para o Futuro Empreendedor",
    description: "Que está cansado do trabalho tradicional e sonha em construir seu próprio negócio, sendo seu próprio chefe."
  },
  {
    title: "Para o Investidor Experiente",
    description: "Que já conhece o mercado, mas busca estratégias avançadas para maximizar os lucros e diversificar seus investimentos."
  },
  {
    title: "Para Quem Busca um Atalho",
    description: "Que valoriza seu tempo e quer aprender diretamente com um especialista de 30 anos de experiência, sem perder tempo com erros."
  },
  {
    title: "Para Quem Quer a Verdade",
    description: "Que está de saco cheio de 'gurus' e busca um método prático, direto ao ponto e sem enrolação, com suporte real."
  },
  {
    title: "Para Quem Pensa no Futuro",
    description: "Que entende que o ouro é uma reserva de valor e quer construir um patrimônio sólido e seguro para si e sua família."
  }
];

const Audience = () => {
  return (
    <section className="bg-black py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Título da Seção */}
        <div className="mb-16 flex flex-col items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center">
            Para Quem é o Curso
          </h2>
          <Image
            src="/GUText.png" // Certifique-se que o nome do arquivo corresponde
            alt="Garimpo Urbano"
            width={400} // Ajuste a LARGURA da sua imagem de logo
            height={80} // Ajuste a ALTURA da sua imagem de logo
            className="h-auto w-full max-w-md" 
          />
          
          <p className="text-lg text-gray-400 text-center">
            Se você se identifica com um destes perfis, você está no lugar certo.
          </p>
        </div>

        {/* 2. Layout de Cards em Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audienceItems.map((item, index) => (
            // 3. O Card Individual
            <div 
              key={index} 
              className="bg-gray-900/80 p-6 rounded-lg border border-gray-800 flex flex-col items-start gap-4 hover:border-green-500 hover:scale-105 transition-all duration-300"
            >
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
