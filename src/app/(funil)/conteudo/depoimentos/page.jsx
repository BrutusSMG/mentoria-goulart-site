// src/app/(funil)/conteudo/depoimentos/page.jsx

import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Depoimentos de Alunos | Garimpo Urbano',
  robots: 'noindex, nofollow',
};

// Lista de vídeos (atualize aqui quando tiver novos depoimentos)
const depoimentos = [
  {
    nome: "Aluno 1 — Campo Grande, MS",
    descricao: "Começou coletando sucata e hoje tem um caminhão cheio de material todos os dias.",
    youtubeId: "SEU_VIDEO_ID_1", // Substitua pelo ID real do YouTube
  },
  {
    nome: "Aluno 2 — São Paulo, SP",
    descricao: "Saiu do zero e em 6 meses já recuperava ouro em casa com segurança.",
    youtubeId: "SEU_VIDEO_ID_2",
  },
  // Adicione mais depoimentos conforme necessário
];

export default async function DepoimentosPage({ searchParams }) {
  const { email } = await searchParams;

  if (!email) {
    redirect('/');
  }

  const lead = await prisma.lead.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!lead) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#d89900] uppercase tracking-wider text-sm mb-4">
          Resultados Reais
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          O Que Acontece Quando Você Aplica o Método
        </h1>
        <p className="text-lg text-gray-300 mb-12">
          Conheça a história de pessoas comuns que decidiram transformar lixo eletrônico 
          em oportunidade — e estão colhendo os resultados.
        </p>

        {/* GRID DE VÍDEOS */}
        <div className="space-y-10 mb-16">
          {depoimentos.map((dep, index) => (
            <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${dep.youtubeId}`}
                  title={dep.nome}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{dep.nome}</h3>
                <p className="text-gray-400">{dep.descricao}</p>
              </div>
            </div>
           ))}
        </div>

        {/* CTA */}
        <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">
            Pronto para escrever a <span className="text-[#d89900]">sua história</span>?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Esses alunos começaram exatamente de onde você está agora. 
            A diferença? Eles tiveram acesso ao método certo.
          </p>
          <Link 
            href="/mentoria"
            className="bg-[#d89900] text-black font-bold text-lg py-3 px-8 rounded-lg hover:bg-[#F7FA83] transition-colors inline-block"
          >
            Quero Começar Minha Jornada
          </Link>
        </div>
      </div>
    </div>
  );
}
