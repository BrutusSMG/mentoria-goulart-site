// src/components/HomePageProducts.jsx
import React from 'react';

const HomePageProducts = () => {
  const features = [
    {
      title: "Cursos Online",
      description: "Cursos destinados aos leigos, em vídeo-aulas online, no passo-a-passo para acessar a qualquer hora, de qualquer lugar e quantas vezes quiser durante um ano.",
      icon: (
        <svg className="w-8 h-8 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "E-book's",
      description: "E-books com profunda abordagem, em linguagem simples, no passo-a-passo para o aperfeiçoamento do profissional. Material recomendado a quem já atua no ramo e quer se aprimorar.",
      icon: (
        <svg className="w-8 h-8 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Mentoria Online",
      description: "Acompanhamento que o especialista presta ao aluno no decorrer do curso, via chamadas de vídeo, voz ou texto, conforme a conveniência do aluno, para esclarecer todas as dúvidas.",
      icon: (
        <svg className="w-8 h-8 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      )
    },
    {
      title: "Comunidade",
      description: "Os alunos participam de um grupo exclusivo no WhatsApp para compartilhamento de dúvidas, experiências e os êxitos de cada um.",
      icon: (
        <svg className="w-8 h-8 text-[#d89900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <section id="produtos" className="bg-black py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Nossa Estrutura de <span className="text-[#d89900]">Treinamentos</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Para Garimpeiros Urbanos, Ourives e Produtores de Semijoias. Escolha o formato ideal para o seu momento profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:border-[#d89900] transition-colors duration-300"
            >
              <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePageProducts;