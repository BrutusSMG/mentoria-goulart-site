"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, Loader2, Plus, Search, AlertCircle } from "lucide-react";
import OrganizacaoFormulario from "@/components/admin/OrganizacaoFormulario";
import {
  apiOrganizacoes,
  formatarDataOrganizacao,
  nomeOrganizacao,
  ROTULOS_OPERACAO,
  ROTULOS_VALIDACAO,
} from "@/lib/organizacoes-admin-ui";

const SELECT = "rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]";

export default function OrganizacoesPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [validacao, setValidacao] = useState("");
  const [operacao, setOperacao] = useState("");
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);

  const carregar = useCallback(async (signal) => {
    setCarregando(true);
    setErro("");
    const params = new URLSearchParams({ page: String(pagina), pageSize: "20" });
    if (pesquisa) params.set("q", pesquisa);
    if (validacao) params.set("statusValidacao", validacao);
    if (operacao) params.set("statusOperacional", operacao);
    try {
      const dados = await apiOrganizacoes(`/api/admin/organizacoes?${params.toString()}`);
      if (!signal?.aborted) setResultado(dados);
    } catch (error) {
      if (!signal?.aborted) { setResultado(null); setErro(error.message); }
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }, [pagina, pesquisa, validacao, operacao]);

  useEffect(() => {
    const controller = new AbortController();
    void carregar(controller.signal);
    return () => controller.abort();
  }, [carregar]);

  const mudarFiltro = (setter, valor) => { setter(valor); setPagina(1); };
  const aplicarBusca = (event) => {
    event.preventDefault();
    mudarFiltro(setPesquisa, busca.trim());
  };
  const paginas = resultado?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#d89900]">Gestão empresarial · Etapa 7</p>
          <h1 className="mt-2 text-3xl font-black text-white">Organizações</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Cadastre empresas, acompanhe a validação interna e gerencie representantes.
            A organização cadastrada não se torna fornecedora automaticamente.
          </p>
        </div>
        {!novo ? (
          <button type="button" onClick={() => setNovo(true)}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black hover:bg-[#f5b91b]">
            <Plus className="h-4 w-4" /> Nova organização
          </button>
        ) : null}
      </div>

      {novo ? (
        <OrganizacaoFormulario
          onCancelar={() => setNovo(false)}
          onSalvo={(item) => { setNovo(false); router.push(`/admin/organizacoes/${encodeURIComponent(item.id)}`); }}
        />
      ) : null}

      <form onSubmit={aplicarBusca} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
        <label className="relative">
          <span className="sr-only">Pesquisar organizações</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
          <input value={busca} maxLength={120} onChange={(event) => setBusca(event.target.value)}
            placeholder="Nome, CNPJ ou e-mail" className={`${SELECT} w-full pl-10`} />
        </label>
        <label>
          <span className="sr-only">Situação da validação</span>
          <select value={validacao} onChange={(event) => mudarFiltro(setValidacao, event.target.value)} className={`${SELECT} w-full`}>
            <option value="">Todas as validações</option>
            {Object.entries(ROTULOS_VALIDACAO).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Situação operacional</span>
          <select value={operacao} onChange={(event) => mudarFiltro(setOperacao, event.target.value)} className={`${SELECT} w-full`}>
            <option value="">Todas as situações</option>
            {Object.entries(ROTULOS_OPERACAO).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black">Buscar</button>
      </form>

      {erro ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{erro}</span>
          <button type="button" onClick={() => void carregar()} className="ml-auto underline">Tentar novamente</button>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 p-5">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-[#d89900]" /><h2 className="font-semibold text-white">Empresas cadastradas</h2></div>
          <p className="text-sm text-zinc-400">{resultado?.pagination?.total ?? 0} registros</p>
        </div>
        {carregando ? <div className="flex items-center justify-center gap-2 p-12 text-zinc-400"><Loader2 className="h-5 w-5 animate-spin" /> Carregando...</div>
          : !resultado?.items?.length ?
            <div className="p-12 text-center text-sm text-zinc-400">Nenhuma organização encontrada para os filtros selecionados.</div>
          : <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-zinc-800/60 text-xs uppercase text-zinc-400">
                  <tr><th className="p-4">Organização</th><th className="p-4">CNPJ</th><th className="p-4">Validação</th><th className="p-4">Operação</th><th className="p-4">Cadastro</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {resultado.items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40">
                      <td className="p-4"><Link href={`/admin/organizacoes/${encodeURIComponent(item.id)}`} className="font-semibold text-white hover:text-[#d89900]">{nomeOrganizacao(item)}</Link>
                        <p className="mt-1 text-xs text-zinc-500">{item.email || "E-mail não informado"}</p>
                      </td>
                      <td className="p-4 text-zinc-300">{item.cnpj || "Não informado"}</td>
                      <td className="p-4 text-zinc-300">{ROTULOS_VALIDACAO[item.statusValidacao] || item.statusValidacao}</td>
                      <td className="p-4 text-zinc-300">{ROTULOS_OPERACAO[item.statusOperacional] || item.statusOperacional}</td>
                      <td className="p-4 text-zinc-500">{formatarDataOrganizacao(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 p-4">
          <span className="text-sm text-zinc-400">Página {resultado?.pagination?.page || pagina} de {paginas}</span>
          <div className="flex gap-2">
            <button type="button" disabled={carregando || pagina <= 1} onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
            <button type="button" disabled={carregando || pagina >= paginas} onClick={() => setPagina((atual) => atual + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 disabled:opacity-40">Próxima<ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
