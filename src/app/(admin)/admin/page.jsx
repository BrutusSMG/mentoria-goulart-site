// src/app/(admin)/admin/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpenCheck,
  Download,
  Loader2,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function CardMetrica({ titulo, valor, descricao, Icon, cor = "text-[#d89900]" }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{titulo}</p>
          <p className="text-3xl font-black text-white mt-3">{valor}</p>
          <p className="text-zinc-600 text-xs mt-2">{descricao}</p>
        </div>
        <Icon className={`w-5 h-5 ${cor} shrink-0`} />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      try {
        const resposta = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });
        const payload = await resposta.json();

        if (!resposta.ok) {
          throw new Error(payload.error || "Não foi possível carregar o dashboard.");
        }

        if (ativo) setDados(payload);
      } catch (error) {
        if (ativo) setErro(error.message);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarDashboard();
    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d89900] animate-spin" />
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-bold text-white">Não foi possível carregar o dashboard</h2>
          <p className="text-sm text-zinc-400 mt-1">{erro || "Tente atualizar a página."}</p>
        </div>
      </div>
    );
  }

  const { resumo, funil, leadsRecentes } = dados;
  const larguraDownload = `${Math.min(resumo.taxaDownload, 100)}%`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[#d89900] uppercase tracking-wider font-bold text-xs">Visão geral</p>
          <h2 className="text-3xl font-black text-white mt-2">Dashboard</h2>
          <p className="text-zinc-500 text-sm mt-2">
            Indicadores de captação e entrega do e-book, atualizados a partir do banco de dados.
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]"
        >
          <UsersRound className="w-4 h-4" />
          Ver todos os leads
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <CardMetrica
          titulo="Total de leads"
          valor={resumo.totalLeads.toLocaleString("pt-BR")}
          descricao="Contatos capturados no banco"
          Icon={UsersRound}
          cor="text-blue-400"
        />
        <CardMetrica
          titulo="E-books baixados"
          valor={resumo.ebooksBaixados.toLocaleString("pt-BR")}
          descricao="Downloads confirmados pela rota do e-book"
          Icon={BookOpenCheck}
          cor="text-green-400"
        />
        <CardMetrica
          titulo="Taxa de download"
          valor={`${resumo.taxaDownload.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%`}
          descricao="Entre todos os leads cadastrados"
          Icon={TrendingUp}
          cor="text-purple-400"
        />
        <CardMetrica
          titulo="Novos nos últimos 7 dias"
          valor={resumo.leadsUltimosSeteDias.toLocaleString("pt-BR")}
          descricao="Captações recentes"
          Icon={UserRoundPlus}
          cor="text-[#d89900]"
        />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#d89900]" />
            <h3 className="font-bold text-white">Funil do e-book</h3>
          </div>

          <div className="mt-7 space-y-5">
            <div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-400">Leads captados</span>
                <strong className="text-white">{funil.captados.toLocaleString("pt-BR")}</strong>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full w-full bg-zinc-600 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-zinc-400">E-book baixado</span>
                <strong className="text-green-400">{funil.baixaramEbook.toLocaleString("pt-BR")}</strong>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: larguraDownload }} />
              </div>
            </div>

            <div className="flex justify-between items-center bg-black/30 border border-zinc-800 rounded-lg p-4">
              <span className="text-sm text-zinc-400">Aguardando download</span>
              <strong className="text-[#d89900]">{funil.aguardandoDownload.toLocaleString("pt-BR")}</strong>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed mt-6">
            Métricas de abertura de e-mail, clique e compra serão adicionadas depois da integração com Brevo e Hotmart.
          </p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-6 border-b border-zinc-800">
            <div>
              <h3 className="font-bold text-white">Leads mais recentes</h3>
              <p className="text-sm text-zinc-500 mt-1">Últimos cinco cadastros recebidos.</p>
            </div>
            <Link href="/admin/leads" className="text-sm font-bold text-[#d89900] hover:text-[#F7FA83]">
              Abrir lista
            </Link>
          </div>

          {leadsRecentes.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500">Ainda não há leads cadastrados.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {leadsRecentes.map((lead) => (
                <div key={lead.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{lead.nome || "Sem nome"}</p>
                    <p className="text-sm text-zinc-500 truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${lead.baixouEbook ? "bg-green-500/15 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {lead.baixouEbook ? "E-book baixado" : "Aguardando download"}
                    </span>
                    <span className="text-xs text-zinc-600 whitespace-nowrap">{formatarData(lead.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}