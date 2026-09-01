// src/app/(admin)/admin/alunos/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  UsersRound,
} from "lucide-react";

function formatarData(data) {
  if (!data) return "Nunca";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function classeStatus(status) {
  if (status === "ATIVO") return "bg-green-500/15 text-green-400";
  if (status === "SUSPENSO") return "bg-orange-500/15 text-orange-300";
  if (status === "INATIVO") return "bg-red-500/15 text-red-300";
  return "bg-amber-500/15 text-amber-200";
}

function EstadoVazio() {
  return (
    <div className="p-12 text-center">
      <UsersRound className="mx-auto h-7 w-7 text-zinc-600" />
      <h3 className="mt-4 font-bold text-white">Nenhum aluno encontrado</h3>
      <p className="mt-2 text-sm text-zinc-500">
        Tente alterar a busca ou o filtro de status.
      </p>
    </div>
  );
}

export default function AlunosPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      q: buscaAplicada,
      status,
    });
    return params.toString();
  }, [page, buscaAplicada, status]);

  useEffect(() => {
    let ativo = true;

    async function carregarAlunos() {
      setLoading(true);
      setErro("");
      try {
        const resposta = await fetch(`/api/admin/alunos?${queryString}`, {
          cache: "no-store",
        });
        const payload = await resposta.json();
        if (!resposta.ok) {
          throw new Error(payload.error || "Não foi possível carregar os alunos.");
        }
        if (ativo) setDados(payload);
      } catch (error) {
        if (ativo) setErro(error.message || "Não foi possível carregar os alunos.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarAlunos();
    return () => {
      ativo = false;
    };
  }, [queryString]);

  function aplicarBusca(event) {
    event.preventDefault();
    setPage(1);
    setBuscaAplicada(busca.trim());
  }

  function alterarStatus(valor) {
    setPage(1);
    setStatus(valor);
  }

  function mudarPagina(valor) {
    setPage(valor);
  }

  const total = dados?.pagination?.total ?? 0;
  const pagina = dados?.pagination?.page ?? 1;
  const totalPages = dados?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#d89900]">
          Gestão de alunos
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">Alunos</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Consulte alunos, matrículas, status de acesso e visibilidade na comunidade.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">Resultado atual</p>
              <p className="mt-2 text-2xl font-black text-white">{total}</p>
            </div>
            <GraduationCap className="h-5 w-5 text-[#d89900]" />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:col-span-2">
          <p className="text-sm text-zinc-400">Uso da tela</p>
          <p className="mt-2 text-sm text-zinc-300">
            Esta versão é somente consulta. Bloqueio, reativação e redefinição de senha serão adicionados após a validação da listagem.
          </p>
        </div>
      </div>

      <form
        onSubmit={aplicarBusca}
        className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_240px_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Buscar aluno</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900]"
            placeholder="Buscar por nome ou e-mail"
          />
        </label>
        <label>
          <span className="sr-only">Status do aluno</span>
          <select
            value={status}
            onChange={(event) => alterarStatus(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="all">Todos os status</option>
            {(dados?.statusDisponiveis || []).map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
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
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h3 className="font-bold text-white">Não foi possível carregar os alunos</h3>
            <p className="mt-1 text-sm text-zinc-400">{erro}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
            <GraduationCap className="h-5 w-5 text-[#d89900]" />
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{total.toLocaleString("pt-BR")}</strong>{" "}
              aluno{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-zinc-800/70 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="p-4 font-semibold">Aluno</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Matrículas</th>
                  <th className="p-4 font-semibold">Comunidade</th>
                  <th className="p-4 font-semibold">Último login</th>
                  <th className="p-4 font-semibold">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d89900]" />
                    </td>
                  </tr>
                ) : dados?.items?.length ? (
                  dados.items.map((aluno) => (
                    <tr key={aluno.id} className="transition-colors hover:bg-zinc-800/40">
                      <td className="p-4">
                        <p className="font-medium text-white">{aluno.nome || "Sem nome"}</p>
                        <p className="mt-1 text-sm text-zinc-500">{aluno.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classeStatus(aluno.status)}`}>
                          {aluno.statusRotulo}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {aluno.matriculas?.length ? aluno.matriculas.map((matricula) => (
                            <p key={matricula.id} className="text-sm text-zinc-300">
                              {matricula.produtoNome}{" "}
                              <span className="text-xs text-zinc-600">({matricula.status})</span>
                            </p>
                          )) : <span className="text-sm text-zinc-600">Nenhuma</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-400">
                        {aluno.perfil?.visibilidade === "ALUNOS" ? "Compartilhado" : "Privado"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm text-zinc-500">{formatarData(aluno.ultimoLoginEm)}</td>
                      <td className="p-4 whitespace-nowrap text-sm text-zinc-500">{formatarData(aluno.createdAt)}</td>
                    </tr>
                  ))
                ) : <tr><td colSpan={6}><EstadoVazio /></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 border-t border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">Página {pagina} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mudarPagina(Math.max(1, pagina - 1))}
                disabled={loading || pagina <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => mudarPagina(Math.min(totalPages, pagina + 1))}
                disabled={loading || pagina >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}