// src/components/HomePageAuthor.jsx
import Image from 'next/image';

const HomePageAuthor = () => {
  return (
    <section id="sobre" className="bg-[#111] py-24 px-4 border-t border-zinc-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Lado Esquerdo: Foto do Especialista */}
          <div className="w-full md:w-1/2 relative">
            {/* Efeito de brilho dourado atrás da foto */}
            <div className="absolute inset-0 bg-[#d89900] blur-[100px] opacity-20 rounded-full"></div>
            
            <div className="relative aspect-square md:aspect-4/5 w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
              <Image 
                src="/ProfGoulart.png" 
                alt="Professor José Goulart Filho" 
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Lado Direito: Copy / Texto */}
          <div className="w-full md:w-1/2">
            <span className="text-[#d89900] font-bold tracking-wider uppercase text-sm mb-2 block">
              O Especialista
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
              Quem é <span className="text-[#d89900]">José Goulart Filho?</span>
            </h2>
            
            {/* ========================================== */}
            {/* OPÇÃO 1: DESKTOP (História e Conexão)        */}
            {/* ========================================== */}
            <div className="hidden md:block">
              <h3 className="text-xl text-gray-400 italic mb-6">
                De aprendiz frustrado a pioneiro do Garimpo Urbano no Brasil.
              </h3>
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  &quot;Sou graduado em Processos Metalúrgicos, pós-graduado em Coaching Empresarial e atuo há quase 30 anos na recuperação e refino de metais preciosos (ouro, prata, paládio, platina e ródio). Mas a minha história não começou com diplomas.
                </p>
                <p>
                  Quando iniciei nesse mercado, eu não tinha formação em química e enfrentei um cenário desolador: quem tinha o conhecimento o guardava como um segredo de estado. Para aprender o básico, cheguei a investir o equivalente a mais de 30 mil reais em métodos que eram precários, caros e que agrediam o meio ambiente. Eu perdia metais valiosos e trabalhava com medo.
                </p>
                <p>
                  Aos 46 anos, decidi mudar o rumo da minha história. Enfrentei 33 km diários de viagens exaustivas para cursar a universidade. Pensei em desistir várias vezes, mas o apoio incondicional da minha esposa e da minha filha me manteve de pé. Lá, desenvolvi um método próprio, seguro, barato e ecológico.
                </p>
                <p>
                  Hoje, sou especialista não apenas em refino, mas em Estruturação de Novos Negócios. Diferente daqueles que me fecharam as portas no passado, minha missão de vida é multiplicar o conhecimento. Criei o treinamento Garimpo Urbano para entregar a você, de forma simples e mastigada, o que eu levei décadas e investi fortunas para aprender.&quot;
                </p>
              </div>
            </div>

            {/* ========================================== */}
            {/* OPÇÃO 2: MOBILE (Dinâmico e Escaneável)      */}
            {/* ========================================== */}
            <div className="block md:hidden">
              <div className="space-y-5 text-gray-300 text-base leading-relaxed mt-6">
                <p>
                  Sou especialista em Recuperação e Refino de metais preciosos e criador do método Garimpo Urbano. Mas minha jornada até aqui exigiu muito suor e resiliência:
                </p>
                <ul className="space-y-4">
                  <li>
                    <strong className="text-white block mb-1">O Início Difícil:</strong> 
                    Comecei sem formação em química. Na época, o conhecimento era tratado como &quot;segredo de estado&quot;. Gastei mais de R$ 30 mil para aprender métodos precários, caros e que poluíam o meio ambiente.
                  </li>
                  <li>
                    <strong className="text-white block mb-1">A Virada aos 46 Anos:</strong> 
                    Inconformado com as perdas e os riscos, voltei a estudar. Enfrentei 33 km de viagem diária até a universidade. Com o apoio da minha família, me formei em Processos Metalúrgicos e criei um método inovador, barato e ecológico.
                  </li>
                  <li>
                    <strong className="text-white block mb-1">Visão de Negócios:</strong> 
                    Além da metalurgia, sou pós-graduado em Coaching Empresarial, o que me permite ajudar meus alunos não apenas a refinar metais, mas a estruturar negócios lucrativos do zero.
                  </li>
                  <li>
                    <strong className="text-white block mb-1">Minha Missão:</strong> 
                    Acredito que o conhecimento deve ser multiplicado. Meu compromisso é encurtar o seu caminho e ensinar, passo a passo, o que aprendi a duras penas ao longo de quase 30 anos.
                  </li>
                </ul>
              </div>
            </div>

            {/* Mini-cards de Autoridade (Aparecem em ambos) */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-black border border-zinc-800 p-4 rounded-lg border-l-4 border-l-[#d89900]">
                <h4 className="text-2xl font-bold text-white mb-1">30 Anos</h4>
                <p className="text-sm text-gray-400">De Experiência Prática</p>
              </div>
              <div className="bg-black border border-zinc-800 p-4 rounded-lg border-l-4 border-l-[#d89900]">
                <h4 className="text-2xl font-bold text-white mb-1">Método</h4>
                <p className="text-sm text-gray-400">Ecológico e Validado</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageAuthor;
