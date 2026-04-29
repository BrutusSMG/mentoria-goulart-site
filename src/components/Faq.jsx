// src/components/Faq.jsx
"use client"; 

import { useState } from 'react'; 
import { ChevronDown, HelpCircle } from 'lucide-react';

// Array de objetos para as perguntas e respostas.
const faqItems = [
  {
    question: 'Como terei acesso à mentoria?',
    answer: 'O acesso é imediato após a confirmação do pagamento. Você receberá um e-mail com todas as instruções para acessar a plataforma e a comunidade.',
  },
  {
    question: 'Por quanto tempo terei acesso?',
    answer: 'O acesso à mentoria e a todos os bônus é vitalício. Você poderá ver e rever as aulas quantas vezes quiser, para sempre.',
  },
  {
    question: 'Preciso ter algum conhecimento prévio?',
    answer: 'Não! A mentoria foi desenhada para levar qualquer pessoa do zero absoluto até as estratégias mais avançadas. Abordamos todos os fundamentos necessários.',
  },
  {
    question: 'As aulas são ao vivo ou gravadas?',
    answer: 'A maioria do conteúdo é gravada para você assistir no seu próprio ritmo. Além disso, temos encontros ao vivo periódicos para tirar dúvidas e fazer análises de mercado.',
  },
];

// Componente para um único item do FAQ
const FaqItem = ({ item, isOpen, onToggle }) => {
  return (
    // 1. Cada item agora é um "card" com fundo e borda
    <div className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left p-6"
      >
        {/* 2. Título muda de cor quando está ativo */}
        <h3 className={`text-lg font-semibold ${isOpen ? 'text-[#d89900]' : 'text-white'}`}>
          {item.question}
        </h3>
        <ChevronDown
          className={`h-6 w-6 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#d89900]' : 'text-gray-400'}`}
        />
      </button>
      
      {/* 3. Container da resposta com animação de altura */}
      <div 
        className={`grid overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="text-gray-300 leading-relaxed px-6 pb-6">
            <p>{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal do FAQ
const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-black py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* 4. Título da seção aprimorado */}
        <div className="text-center mb-12">
          <HelpCircle className="h-12 w-12 text-[#d89900] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Ainda tem alguma dúvida?
          </h2>
          <p className="text-lg text-gray-400 mt-3">
            Encontre aqui as respostas para as perguntas mais comuns.
          </p>
        </div>
        
        {/* 5. Adicionamos um 'space-y-4' para espaçar os cards */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
