// src/components/Audience.jsx
import { CheckCircle2 } from 'lucide-react'; // Importando o ícone que acabamos de instalar

// Melhor Prática: Manter o conteúdo (os textos da lista) em um array.
// Facilita a manutenção e a leitura do código.
const audienceItems = [
  'Para quem busca uma nova fonte de renda através da internet.',
  'Para quem é iniciante e quer começar a investir em ouro do jeito certo.',
  'Para quem já investe e quer aprimorar suas estratégias e lucros.',
  'Para quem deseja aprender com um especialista com resultados comprovados.',
  'Para quem busca um método prático e direto ao ponto, sem enrolação.',
];

const Audience = () => {
  return (
    <section className="bg-black py-16 px-4">
      <div className="container mx-auto max-w-3xl"> {/* Limitando a largura para melhor legibilidade */}
        {/* Título da Seção */}
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Para quem é a <span className="text-green-500">Mentoria?</span>
        </h2>

        {/* Lista de Itens */}
        <div className="space-y-4"> {/* Adiciona espaço vertical entre os itens da lista */}
          {audienceItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div>
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-lg text-gray-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Audience;
