// src/app/(funil)/conteudo/valores-sucata/page.jsx

import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Tabela de Valores | Garimpo Urbano',
  robots: 'noindex, nofollow', // Impede indexação pelo Google
};

export default async function ValoresSucataPage({ searchParams }) {
  const { email } = await searchParams;

  // Proteção: sem e-mail → redireciona
  if (!email) {
    redirect('/');
  }

  // Proteção: e-mail não cadastrado → redireciona
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-10">
          <table className="w-full text-left">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 font-semibold">Tipo de Material</th>
                <th className="p-4 font-semibold">Metais Presentes</th>
                <th className="p-4 font-semibold text-right">Valor Médio (R$/kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Processadores Cerâmicos (Pentium Pro, 486)</td>
                <td className="p-4 text-sm text-gray-400">Ouro, Prata</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 800 – R$ 1.500</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Processadores Plásticos (Pentium, Core)</td>
                <td className="p-4 text-sm text-gray-400">Ouro</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 150 – R$ 400</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Placas de Celular (sem bateria/tela)</td>
                <td className="p-4 text-sm text-gray-400">Ouro, Prata, Paládio</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 80 – R$ 150</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Memórias RAM (contatos dourados)</td>
                <td className="p-4 text-sm text-gray-400">Ouro</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 100 – R$ 200</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Placas-mãe de PC/Servidor</td>
                <td className="p-4 text-sm text-gray-400">Ouro, Prata, Paládio</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 30 – R$ 80</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="p-4">Radiografias (chapas de raio-X)</td>
                <td className="p-4 text-sm text-gray-400">Prata</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 8 – R$ 15</td>
              </tr>
              <tr>
                <td className="p-4">Velas de Ignição (platina/irídio)</td>
                <td className="p-4 text-sm text-gray-400">Platina, Irídio</td>
                <td className="p-4 text-right text-green-400 font-bold">R$ 3 – R$ 8 / unidade</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-500 mb-10">
          * Valores de referência (jul/2026) que variam conforme cotação do dólar e do metal. 
          Classificação correta do material pode aumentar significativamente o valor de venda.
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