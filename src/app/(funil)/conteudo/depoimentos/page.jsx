// src/app/(funil)/conteudo/depoimentos/page.jsx
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Depoimentos de Alunos | Garimpo Urbano',
  robots: 'noindex, nofollow',
};

export default async function DepoimentosPage({ searchParams }) {
  const { email } = await searchParams;

  if (!email) redirect('/');

  const lead = await prisma.lead.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!lead) redirect('/');

  // Busca depoimentos aprovados do banco, destaques primeiro
  const depoimentos = await prisma.depoimento.findMany({
    where: { aprovado: true },
    orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
  });

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

        {/* GRID DE DEPOIMENTOS */}
        {depoimentos.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p>Novos depoimentos em breve.</p>
          </div>
        ) : (
          <div className="space-y-10 mb-16">
            {depoimentos.map((dep) => (
              <div key={dep.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                {/* Vídeo do YouTube (se tiver) */}
                {dep.videoUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${dep.videoUrl}`}
                      title={dep.nome}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                 )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{dep.nome}</h3>
                  <p className="text-gray-400">{dep.texto}</p>
                </div>
              </div>
            ))}
          </div>
        )}

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
