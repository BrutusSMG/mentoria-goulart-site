// src/components/Bonus.jsx
import { Gift, Users, MessageSquareHeart } from 'lucide-react'; // Ícones relevantes para bônus

// Novamente, um array de objetos para manter tudo organizado.
const bonusItems = [
  {
    icon: <Gift className="h-10 w-10 text-green-500" />,
    title: 'Bônus 1: Planilha de Gerenciamento',
    description: 'Receba a planilha exclusiva que eu uso para controlar minhas operações e maximizar lucros.',
  },
  {
    icon: <Users className="h-10 w-10 text-green-500" />,
    title: 'Bônus 2: Comunidade VIP',
    description: 'Acesso a um grupo fechado com outros alunos para trocar experiências e tirar dúvidas em tempo real.',
  },
  {
    icon: <MessageSquareHeart className="h-10 w-10 text-green-500" />,
    title: 'Bônus 3: Suporte Individual',
    description: 'Tenha acesso direto ao meu suporte para uma análise personalizada das suas estratégias.',
  },
];

const Bonus = () => {
  return (
    <section className="bg-black py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Título da Seção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            E ainda tem mais... Você vai receber <span className="text-green-500">3 bônus exclusivos!</span>
          </h2>
        </div>

        {/* Lista de Bônus */}
        <div className="grid md:grid-cols-2 gap-8">
          {bonusItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 p-6 bg-gray-900/50 rounded-lg">
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

export default Bonus;
