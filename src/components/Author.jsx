// src/components/Author.jsx
import Image from 'next/image';
import { HeartHandshake } from 'lucide-react';

const Author = () => {
  return (
    <section className="bg-[#171f35] py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Título da Seção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            De uma dificuldade pessoal, nasceu uma missão:
          </h2>
          <p className="text-2xl md:text-3xl text-green-500 font-semibold mt-2">
            A sua jornada para o sucesso.
          </p>
        </div>

        {/* Container Principal */}
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12 p-8 rounded-lg shadow-xl">
          
          {/* Coluna da Imagem */}
          <div className="shrink-0">
            <div className="relative w-48 h-48 md:w-46 md:h-46 rounded-full overflow-hidden shadow-2xl shadow-green-500/20 border-4 border-gray-700">
              <Image
                src="/autor.png"
                alt="Foto de José Goulart Filho"
                width={100} // Ajuste a LARGURA da sua imagem de autor
                height={100} // Ajuste a ALTURA da sua imagem de autor
                className="object-cover h-auto w-full max-w-md"
              />
            </div>
          </div>

          {/* Coluna do Texto Narrativo */}
          <div className="flex-1 space-y-5 text-lg text-gray-300 leading-relaxed">
            <p>
              Olá, eu sou <strong className="text-white">José Goulart Filho.</strong> Hoje, sou especialista em Processos Metalúrgicos com mais de 30 anos de experiência, mas quero te contar como tudo começou.
            </p>
            <p>
              Quando dei meus primeiros passos, eu era como você: cheio de vontade, mas sem um guia. O método que aprendi era <strong className="text-red-400">precário e caro</strong>. E o pior? Quando eu buscava ajuda, o conhecimento era guardado como um segredo de estado. Eu senti na pele essa frustração.
            </p>
            
            {/* Bloco de Destaque para a "Virada" da história */}
            <div className="my-6 p-6 bg-green-400/50 border-l-4 border-yellow-500 rounded-r-lg">
              <p className="text-xl font-semibold text-white italic">
                &ldquo;Foi essa dificuldade que me moveu. Eu decidi que, se não havia um caminho, eu mesmo o construiria.&rdquo;
              </p>
            </div>

            <p>
              Criei este treinamento por um motivo muito simples: ele é o curso que <strong className="text-green-400">eu desesperadamente gostaria que existisse quando comecei.</strong>
            </p>

            {/* Bloco de Compromisso com Ícone */}
            <div className="flex items-start gap-4 pt-4">
              <HeartHandshake className="h-10 w-10 text-green-500 shrink-0 mt-1" />
              <p>
                Meu compromisso é garantir que <strong className="text-white">você não passe pelas mesmas dificuldades que eu passei.</strong> É pegar na sua mão e te dar o mapa completo, sem segredos, para que sua jornada seja muito mais rápida e tranquila.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Author;
