// src/components/mentoria/Opportunity.jsx
import Image from 'next/image';

const Opportunity = () => {
  return (
    <section className="bg-[#171f35] text-white text-center py-12 px-4">
      <div className="container mx-auto px-4">
        {/* Título Principal da Seção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Como Criar um Grande Negócio
          </h2>
          <p className="text-xl md:text-2xl text-[#d89900] font-semibold">
            Com Pequeno Investimento
          </p>
        </div>

        {/* Layout de Duas Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Coluna da Imagem */}
          <div className="w-full h-50 md:h-full relative rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/garimpo-urbano-sucata.png" // Use o nome da sua imagem
              alt="Sucata eletrônica rica em metais preciosos"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Coluna do Texto */}
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <h3 className="text-3xl font-bold text-white border-l-4 border-[#d89900] pl-4">
              Oportunidades inexploradas no setor de reciclagem nobre.
            </h3>
            <p>
              Diariamente, toneladas de sucatas ricas em metais preciosos são descartadas. Este é o <strong className="text-white">Garimpo Urbano</strong>: uma nova fronteira que nasceu no coração das grandes cidades.
            </p>
            <h3 className="text-3xl font-bold text-white border-l-4 border-[#d89900] pl-4 mt-8">
              Um Mercado com Demanda Explosiva
            </h3>
            <p>
              A indústria precisa desesperadamente desses metais, mas <strong className="text-white">faltam profissionais qualificados.</strong> Ou seja, profissão com alta demanda e poucos especialistas no mercado.
            </p>
            <h3 className="text-3xl font-bold text-white border-l-4 border-[#d89900] pl-4 mt-8">
              A Hora de Empreender é Agora
            </h3>
            <p>
              Como diz o ditado: <em className="text-gray-400">&ldquo;quem chega primeiro à fonte, bebe água limpa.&rdquo;</em> Nós formamos você <strong className="text-white">do absoluto zero</strong> para se tornar uma autoridade no setor. Para isso, conte conosco!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Opportunity;
