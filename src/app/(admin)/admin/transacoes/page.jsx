// src/app/(admin)/admin/transacoes/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  Search,
  ShoppingCart,
} from "lucide-react";

const STATUS_LABELS = {
  APPROVED: "Aprovada",
  COMPLETE: "Completa",
  CANCELED: "Cancelada",
  REFUNDED: "Reembolsada",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  CHARGEBACK: "Chargeback",
  BILLET_PRINTED: "Boleto emitido",
  WAITING_PAYMENT: "Aguardando pagamento",
};

function formatarData(data) {
  if (!data) return "Não informado";

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function formatarMoeda(valor, moeda = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: moeda || "BRL",
    }).format(Number(valor || 0));
  } catch {
    return `${moeda || ""} ${Number(valor || 0).toFixed(2)}`.trim();
  }
}

function etiquetaStatus(status) {
  const statusNormalizado = String(status || "").toUpperCase();

  if (["APPROVED", "COMPLETE"].includes(statusNormalizado)) {
    return "bg-green-500/15 text-green-400 border-green-500/20";
  }

  if (["REFUNDED", "PARTIALLY_REFUNDED", "CHARGEBACK", "CANCELED"].includes(statusNormalizado)) {
    return "bg-red-500/15 text-red-400 border-red-500/20";
  }

  return "bg-amber-500/15 text-amber-300 border-amber-500/20";
}

export default function TransacoesPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [status, setStatus] = useState("all");
  const [produtoId, setProdutoId] = useState("all");
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      q: buscaAplicada,
      status,
      produtoId,
    });

    return params.toString();
  }, [page, buscaAplicada, status, produtoId]);

  useEffect(() => {
    let ativo = true;

    async function carregarTransacoes() {
      try {
        const resposta = await fetch(`/api/admin/transacoes?${queryString}`, {
          cache: "no-store",
        });
        const payload = await resposta.json();

        if (!resposta.ok) {
          throw new Error(payload.error || "Não foi possível carregar as transações.");
        }

        if (ativo) setDados(payload);
      } catch (error) {
        if (ativo) setErro(error.message || "Ocorreu uma falha ao consultar as transações.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarTransacoes();

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

  function alterarFiltro(atualizar, valor) {
    setLoading(true);
    setErro("");
    setPage(1);
    atualizar(valor);
  }

  function irParaPagina(proximaPagina) {
    setLoading(true);
    setErro("");
    setPage(proximaPagina);
  }

  const total = dados?.pagination?.total ?? 0;
  const pagina = dados?.pagination?.page ?? 1;
  const totalPages = dados?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-7">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-[#d89900] uppercase tracking-wider font-bold text-xs">Hotmart</p>
          <h2 className="text-3xl font-black text-white mt-2">Transações</h2>
          <p className="text-zinc-500 text-sm mt-2">
            Acompanhe compras, pagamentos pendentes, cancelamentos, reembolsos e chargebacks recebidos pelo Webhook.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-400">
          <CircleDollarSign className="w-4 h-4 text-[#d89900]" />
          Dados atualizados por eventos da Hotmart
        </div>
      </div>

      <form
        onSubmit={aplicarBusca}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_190px_220px_auto] gap-3"
      >
        <label className="relative block">
          <span className="sr-only">Buscar transação</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900]"
            placeholder="Código, e-mail do comprador ou produto"
          />
        </label>

        <label>
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(event) => alterarFiltro(setStatus, event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="all">Todos os status</option>
            {(dados?.statusDisponiveis || []).map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item] || item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Produto</span>
          <select
            value={produtoId}
            onChange={(event) => alterarFiltro(setProdutoId, event.target.value)}
            className="w-full rounded-lg bg-black border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="all">Todos os produtos</option>
            {(dados?.produtos || []).map((produto) => (
              <option key={produto.produtoId} value={produto.produtoId}>
                {produto.produtoNome || `Produto ${produto.produtoId}`}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]"
        >
          Buscar
        </button>
      </form>

      {erro ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-white">Não foi possível carregar as transações</h3>
            <p className="text-sm text-zinc-400 mt-1">{erro}</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#d89900]" />
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{total.toLocaleString("pt-BR")}</strong>{" "}
              transaç{total === 1 ? "ão" : "ões"} encontrada{total === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left">
              <thead className="bg-zinc-800/70 text-zinc-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4 font-semibold">Transação / comprador</th>
                  <th className="p-4 font-semibold">Produto</th>
                  <th className="p-4 font-semibold">Valor</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold">Pagamento</th>
                  <th className="p-4 font-semibold">Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Loader2 className="w-6 h-6 text-[#d89900] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : dados?.items?.length ? (
                  dados.items.map((transacao) => (
                    <tr key={transacao.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-white">{transacao.transacaoCodigo}</p>
                        <p className="text-sm text-zinc-500 mt-1">{transacao.emailComprador || "E-mail não informado"}</p>
                        {transacao.leadId ? (
                          <span className="inline-flex mt-2 rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                            Lead identificado
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-zinc-200 max-w-xs">{transacao.produtoNome || "Produto não informado"}</p>
                        <p className="text-xs text-zinc-600 mt-1">ID: {transacao.produtoId}</p>
                      </td>
                      <td className="p-4 text-sm font-semibold text-white whitespace-nowrap">
                        {formatarMoeda(transacao.valorBruto, transacao.moeda)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex border px-2.5 py-1 rounded-full text-xs font-medium ${etiquetaStatus(transacao.status)}`}>
                          {STATUS_LABELS[transacao.status] || transacao.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">{transacao.formaPagamento || "Não informado"}</td>
                      <td className="p-4 text-sm text-zinc-500 whitespace-nowrap">
                        {formatarData(transacao.aprovadoEm || transacao.criadoEm)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-sm text-zinc-500">
                      Nenhuma transação encontrada com os filtros atuais.
                    </td>
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