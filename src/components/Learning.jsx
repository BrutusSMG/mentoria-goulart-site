// src/components/Learning.jsx
import { BookOpen, BarChart3, ShieldCheck, BrainCircuit } from 'lucide-react'; // Importando ícones relevantes

// Melhor Prática: Usar um array de objetos para dados estruturados.
// Cada objeto contém todas as informações de um item da lista,
// tornando o código extremamente fácil de ler e manter.
const learningItems = [
  {
    icon: <BookOpen className="h-10 w-10 text-green-500" />,
    title: 'Fundamentos do Mercado de Ouro',
    description: 'Entenda o que move o preço do ouro e como se posicionar de forma inteligente.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-green-500" />,
    title: 'Análise Técnica Aplicada',
    description: 'Aprenda a ler gráficos e identificar os melhores pontos de compra e venda.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-green-500" />,
    title: 'Gerenciamento de Risco',
    description: 'Proteja seu capital e minimize perdas, garantindo a sustentabilidade dos seus lucros.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-green-500" />,
    title: 'Psicologia do Trader',
    description: 'Desenvolva a mentalidade correta para operar com confiança e disciplina.',
  },
];

const Learning = () => {
  return (
    <section className="bg-gray-900/50 py-16 px-4"> {/* Um fundo ligeiramente diferente para quebrar a monotonia */}
      <div className="container mx-auto max-w-4xl">
        {/* Título da Seção */}
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          O que você vai <span className="text-green-500">aprender?</span>
        </h2>

        {/* Lista de Itens */}
        <div className="grid md:grid-cols-2 gap-8"> {/* Usando grid para dividir em 2 colunas em telas maiores */}
          {learningItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              {/* Ícone */}
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {/* Título e Descrição */}
              <div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Learning;
