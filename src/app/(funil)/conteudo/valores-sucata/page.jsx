// src/app/(funil)/conteudo/valores-sucata/page.jsx
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Tabela de Valores | Garimpo Urbano',
  robots: 'noindex, nofollow',
};

export default async function ValoresSucataPage({ searchParams }) {
  const { email } = await searchParams;

  if (!email) redirect('/');

  const lead = await prisma.lead.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!lead) redirect('/');

  // Busca os itens ativos do banco, ordenados por categoria
  const sucatas = await prisma.sucataItem.findMany({
    where: { ativo: true },
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
  });

  return (
    <div className="min-h-screen bg-black text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#d89900] uppercase tracking-wider text-sm mb-4">
          Capítulo Extra Exclusivo
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Tabela de Valores do Garimpo Urbano
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Olá, <strong>{lead.nome || 'futuro garimpeiro'}</strong>! Estes são os valores 
          médios de mercado para os principais tipos de sucata eletrônica no Brasil.
        </p>

        {/* TABELA DE VALORES */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-4">
          <table className="w-full text-left">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 font-semibold">Tipo de Material</th>
                <th className="p-4 font-semibold">Metais Presentes</th>
                <th className="p-4 font-semibold text-right">Valor Médio (R$/kg)</th>
              </tr>
            </thead>
            <tbody>
              {sucatas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    Tabela em atualização. Volte em breve.
                  </td>
                </tr>
              ) : (
                sucatas.map((item, idx) => (
                  <tr key={item.id} className={idx < sucatas.length - 1 ? 'border-b border-zinc-800' : ''}>
                    <td className="p-4">{item.nome}</td>
                    <td className="p-4 text-sm text-gray-400">{item.metais}</td>
                    <td className="p-4 text-right text-green-400 font-bold">
                      R$ {item.valorKg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mb-10">
          * Valores de referência que variam conforme cotação do dólar e do metal.
          Atualizado em: {sucatas[0]?.ultimaAtualizacao
            ? new Date(sucatas[0].ultimaAtualizacao).toLocaleDateString('pt-BR')
            : '—'}
        </p>

        {/* INSIGHT + CTA */}
        <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">
            Agora você sabe <span className="text-[#d89900]">quanto vale</span>. 
            Quer aprender <span className="text-[#d89900]">como extrair</span>?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Na Mentoria Garimpo Urbano, eu te ensino o processo completo de recuperação 
            desses metais — do zero ao refino — com segurança e método.
          </p>
          <Link 
            href="/mentoria"
            className="bg-[#d89900] text-black font-bold text-lg py-3 px-8 rounded-lg hover:bg-[#F7FA83] transition-colors inline-block"
          >
            Conhecer a Mentoria Completa
          </Link>
        </div>
      </div>
    </div>
  );
}
