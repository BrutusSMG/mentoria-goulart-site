// src/components/Faq.jsx
"use client"; // Melhor Prática: Diretiva que marca este como um Componente de Cliente.
               // É obrigatório para usar hooks como o useState.

import { useState } from 'react'; // Hook do React para gerenciar estado.
import { ChevronDown } from 'lucide-react'; // Ícone para indicar que pode expandir.

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

// Componente para um único item do FAQ, para manter o código principal limpo.
const FaqItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-700 py-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold">{item.question}</h3>
        <ChevronDown
          className={`h-6 w-6 text-green-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-300">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

// Componente principal do FAQ
const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null); // Estado para controlar qual item está aberto.

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index); // Se clicar no mesmo, fecha. Se clicar em outro, abre.
  };

  return (
    <section className="bg-blac py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Perguntas <span className="text-green-500">Frequentes</span>
        </h2>
        <div>
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
