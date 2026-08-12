// src/app/(admin)/admin/leads/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
  UsersRound,
} from "lucide-react";

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(data));
}

function csvSeguro(valor) {
  const texto = String(valor ?? "").replaceAll('"', '""');
  return `"${texto}"`;
}

export default function LeadsPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [source, setSource] = useState("all");
  const [ebook, setEbook] = useState("all");
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      q: buscaAplicada,
      source,
      ebook,
    });
    return params.toString();
  }, [page, buscaAplicada, source, ebook]);

  useEffect(() => {
    let ativo = true;

    async function carregarLeads() {
      try {
        const resposta = await fetch(`/api/admin/leads?${queryString}`, {
          cache: "no-store",
        });
        const payload = await resposta.json();

        if (!resposta.ok) {
          throw new Error(payload.error || "Não foi possível carregar os leads.");
        }

        if (ativo) setDados(payload);
      } catch (error) {
        if (ativo) setErro(error.message);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarLeads();
    return () => {
      ativo = false;
    };
  }, [queryString]);

  function aplicarBusca(event) {
    event.preventDefault();
    setLoading(true);
    setErro("");
    setPage(1);
    setBuscaAplicada(busca.trim());
  }

  function alterarFiltro(setter, valor) {
    setLoading(true);
    setErro("");
    setPage(1);
    setter(valor);
  }

  function irParaPagina(proximaPagina) {
    setLoading(true);
    setErro("");
    setPage(proximaPagina);
  }

  function exportarPaginaAtual() {
    if (!dados?.items?.length) return;

    const cabecalho = [
      "Nome",
      "E-mail",
      "WhatsApp",
      "Baixou e-book",
      "Origem",
      "Mídia",
      "Campanha",
      "Conteúdo",
      "Termo",
      "Cadastro",
    ];

    const linhas = dados.items.map((lead) => [
      lead.nome,
      lead.email,
      lead.whatsapp,
      lead.baixouEbook ? "Sim" : "Não",
      lead.utmSource || "Não informado",
      lead.utmMedium || "Não informado",
      lead.utmCampaign || "Não informado",
      lead.utmContent || "Não informado",
      lead.utmTerm || "Não informado",
      formatarData(lead.createdAt),
    ]);

    const csv = [cabecalho, ...linhas]
      .map((linha) => linha.map(csvSeguro).join(";"))
      .join("\n");

    const arquivo = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-garimpo-urbano-pagina-${dados.pagination.page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const total = dados?.pagination?.total ?? 0;
  const pagina = dados?.pagination?.page ?? 1;
  const totalPages = dados?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-7">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[#d89900] uppercase tracking-wider font-bold text-xs">Base de contatos</p>
          <h2 className="text-3xl font-black text-white mt-2">Leads</h2>
          <p className="text-zinc-500 text-sm mt-2">Consulte origem, status do e-book e data de cadastro de cada contato.</p>
        </div>
        <button
          type="button"
          onClick={exportarPaginaAtual}
          disabled={!dados?.items?.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-[#d89900] hover:text-[#d89900] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Exportar página atual
        </button>
      </div>

      <form onSubmit={aplicarBusca} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_190px_190px_auto] gap-3">
        <label className="relative block">
          <span className="sr-only">Buscar lead</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900]"
            placeholder="Buscar por nome, e-mail ou WhatsApp"
          />
        </label>

        <label>
          <span className="sr-only">Origem</span>
          <select
            value={source}
            onChange={(event) => alterarFiltro(setSource, event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="all">Todas as origens</option>
            {(dados?.sources || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Status do e-book</span>
          <select
            value={ebook}
            onChange={(event) => alterarFiltro(setEbook, event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="all">Todos os status</option>
            <option value="downloaded">E-book baixado</option>
            <option value="pending">Aguardando download</option>
          </select>
        </label>

        <button type="submit" className="rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]">
          Buscar
        </button>
      </form>

      {erro ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white">Não foi possível carregar os leads</h3>
            <p className="text-sm text-zinc-400 mt-1">{erro}</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
            <UsersRound className="w-5 h-5 text-[#d89900]" />
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{total.toLocaleString("pt-BR")}</strong> lead{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-255 w-full text-left">
              <thead className="bg-zinc-800/70 text-zinc-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">WhatsApp</th>
                  <th className="p-4 font-semibold">Origem / Campanha</th>
                  <th className="p-4 font-semibold text-center">E-book</th>
                  <th className="p-4 font-semibold">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="w-6 h-6 text-[#d89900] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : dados?.items?.length ? (
                  dados.items.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-white">{lead.nome || "Sem nome"}</p>
                        <p className="text-sm text-zinc-500 mt-1">{lead.email}</p>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">{lead.whatsapp || "Não informado"}</td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-300">{lead.utmSource || "Não informado"}</p>
                        <p className="text-xs text-zinc-600 mt-1">{lead.utmCampaign || "Sem campanha"}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${lead.baixouEbook ? "bg-green-500/15 text-green-400" : "bg-zinc-800 text-zinc-400"}`}>
                          {lead.baixouEbook ? "Baixado" : "Pendente"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">{formatarData(lead.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-sm text-zinc-500">Nenhum lead encontrado com os filtros atuais.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-zinc-500">Página {pagina} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => irParaPagina(Math.max(1, pagina - 1))}
                disabled={loading || pagina <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-zinc-500"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => irParaPagina(Math.min(totalPages, pagina + 1))}
                disabled={loading || pagina >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-zinc-500"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}