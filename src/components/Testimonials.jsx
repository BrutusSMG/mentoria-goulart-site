// src/components/Testimonials.jsx
import Image from 'next/image';

// Melhor Prática: Criar um array com os nomes dos arquivos de imagem.
// Isso torna o código mais limpo e fácil de atualizar. Se precisar adicionar ou remover um depoimento,
// você só precisa alterar este array e a imagem na pasta 'public'.
const testimonialImages = [
  'depoimento-01.jpg',
  'depoimento-02.jpg',
  'depoimento-03.jpg',
  'depoimento-04.jpg',
  'depoimento-05.jpg',
  'depoimento-06.jpg',
  'depoimento-07.jpg',
  'depoimento-08.jpg',
  // Adicione quantos nomes de arquivos de imagem você tiver
];

const Testimonials = () => {
  return (
    <section className="bg-black py-16 px-4">
      <div className="container mx-auto">
        {/* Título da Seção */}
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          O que os <span className="text-green-500">alunos dizem</span>
        </h2>

        {/* Grade de Depoimentos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {testimonialImages.map((imageName, index) => (
            <div key={index} className="w-full h-auto rounded-lg overflow-hidden shadow-lg shadow-white/10">
              <Image
                src={`/testimonials/${imageName}`}
                alt={`Depoimento de aluno ${index + 1}`}
                width={400} // A largura e altura aqui são para proporção e otimização
                height={800} // O CSS cuidará do tamanho final na tela
                className="w-full h-full object-cover" // Garante que a imagem preencha o container
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
