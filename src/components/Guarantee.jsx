// src/components/Guarantee.jsx
import Image from 'next/image';

const Guarantee = () => {
  return (
    <section className="bg-gray-900/50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Coluna da Imagem */}
          <div className="flex-shrink-0">
            <Image
              src="/selo-garantia.png" // Certifique-se que o nome do arquivo corresponde
              alt="Selo de Garantia Incondicional de 7 dias"
              width={250} // Tamanho da imagem
              height={250}
            />
          </div>

          {/* Coluna do Texto */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Seu Risco é <span className="text-green-500">ZERO!</span>
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              Você tem 7 dias para explorar todo o conteúdo da mentoria. Se por qualquer motivo você não gostar ou achar que não é para você, basta me enviar uma única mensagem e eu devolverei 100% do seu dinheiro.
            </p>
            <p className="text-lg text-gray-300">
              Sem perguntas, sem burocracia. O risco é todo meu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
