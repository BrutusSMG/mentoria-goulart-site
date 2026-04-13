// src/components/Author.jsx
import Image from 'next/image';

const Author = () => {
  return (
    <section className="bg-gray-900/50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          Quem vai te <span className="text-green-500">guiar</span>
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-black p-8 rounded-lg">
          {/* Coluna da Imagem */}
          <div className="flex-shrink-0">
            <Image
              src="/autor.png" // Certifique-se que o nome do arquivo corresponde
              alt="Foto de José Goulart Filho"
              width={250}
              height={250}
              className="rounded-full object-cover w-[200px] h-[200px] md:w-[250px] md:h-[250px] border-4 border-green-500"
            />
          </div>

          {/* Coluna do Texto */}
          <div className="text-lg text-gray-300 space-y-4">
            <p className="text-2xl font-bold text-white">Olá, eu sou José Goulart Filho.</p>
            <p>
              Com quase <strong className="text-white">30 anos de experiência</strong> no campo de batalha da metalurgia, me especializei em transformar sucata em riqueza, recuperando e refinando metais preciosos como ouro, prata e platina.
            </p>
            <p>
              Eu compilei décadas de conhecimento prático em um método simples e direto para que você não precise passar pelos mesmos obstáculos que eu. Meu objetivo é multiplicar esse conhecimento e guiar você, passo a passo, na jornada para lucrar com essa nobre profissão.
            </p>
            <p className="font-bold text-green-500">Vamos juntos transformar conhecimento em ouro.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Author;
