"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Building2, Loader2, Plus, RefreshCw, ShieldCheck, Users } from "lucide-react";
import OrganizacaoFormulario from "@/components/admin/OrganizacaoFormulario";
import SeletorPessoaOrganizacao from "@/components/admin/SeletorPessoaOrganizacao";
import {
  apiOrganizacoes, formatarDataOrganizacao, nomeOrganizacao,
  ROTULOS_OPERACAO, ROTULOS_VALIDACAO, ROTULOS_VINCULO,
} from "@/lib/organizacoes-admin-ui";

const inputClass = "w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]";
const acaoClass = "rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 hover:border-[#d89900] disabled:cursor-not-allowed disabled:opacity-40";
const botaoPrimario = "rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40";

export default function OrganizacaoDetalhePage({ params }) {
  const { id } = use(params);
  const caminho = `/api/admin/organizacoes/${encodeURIComponent(id)}`;
  const [organizacao, setOrganizacao] = useState(null);
  const [vinculos, setVinculos] = useState([]);
  const [vinculosPagina, setVinculosPagina] = useState(1);
  const [vinculosPaginacao, setVinculosPaginacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [trabalhando, setTrabalhando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [motivo, setMotivo] = useState("");
  const [pessoaSelecionada, setPessoaSelecionada] = useState(null);
  const [funcao, setFuncao] = useState("");

  const carregar = useCallback(async (signal) => {
    setCarregando(true);
    setErro("");
    try {
      const [detalhe, lista] = await Promise.all([
        apiOrganizacoes(caminho),
        apiOrganizacoes(`${caminho}/vinculos?page=${vinculosPagina}&pageSize=20`),
      ]);
      if (!signal?.aborted) {
        setOrganizacao(detalhe.item);
        setVinculos(lista.items || []);
        setVinculosPaginacao(lista.pagination || null);
      }
    } catch (error) {
      if (!signal?.aborted) setErro(error.message);
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }, [caminho, vinculosPagina]);

  useEffect(() => {
    const controller = new AbortController();
    void carregar(controller.signal);
    return () => controller.abort();
  }, [carregar]);

  async function mutacao(url, method, body, mensagem) {
    if (trabalhando) return;
    setTrabalhando(true);
    setErro("");
    setAviso("");
    try {
      await apiOrganizacoes(url, { method, body });
      await carregar();
      setAviso(mensagem);
    } catch (error) {
      setErro(error.message);
    } finally {
      setTrabalhando(false);
    }
  }

  async function criarVinculo(event) {
    event.preventDefault();
    if (!pessoaSelecionada?.id) { setErro("Selecione uma Pessoa."); return; }
    if (trabalhando) return;
    setTrabalhando(true);
    setErro("");
    setAviso("");
    try {
      await apiOrganizacoes(`${caminho}/vinculos`, {
        method: "POST", body: { pessoaId: pessoaSelecionada.id, funcao: funcao.trim() || null },
      });
      setPessoaSelecionada(null); setFuncao("");
      setVinculosPagina(1);
      await carregar();
      setAviso("Vínculo criado como pendente. Ative-o após conferir a identidade da pessoa.");
    } catch (error) {
      setErro(error.message);
    } finally { setTrabalhando(false); }
  }

  const confirmar = (pergunta, callback) => {
    if (window.confirm(pergunta)) void callback();
  };
  if (carregando && !organizacao) return (
    <div className="flex items-center gap-2 p-8 text-zinc-400"><Loader2 className="h-5 w-5 animate-spin" /> Carregando organização...</div>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/organizacoes" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Voltar para Organizações
      </Link>
      {erro ? <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"><AlertCircle className="h-5 w-5 shrink-0" /> {erro}</p> : null}
      {aviso ? <p role="status" className="rounded-lg border border-emerald-600/20 bg-emerald-900/10 p-4 text-sm text-emerald-300">{aviso}</p> : null}
      {!organizacao ? <p className="text-zinc-400">Organização indisponível.</p> : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#d89900]">Cadastro empresarial · Etapa 7</p>
              <h1 className="mt-2 flex items-center gap-3 text-2xl font-black text-white sm:text-3xl">
                <Building2 className="h-7 w-7 text-[#d89900]" />{nomeOrganizacao(organizacao)}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">{organizacao.razaoSocial || "Razão social não informada"} · {organizacao.cnpj || "CNPJ não informado"}</p>
            </div>
            <button type="button" onClick={() => setEditando((atual) => !atual)} className={acaoClass}>
              {editando ? "Fechar edição" : "Editar cadastro"}
            </button>
          </div>
          {editando ? <OrganizacaoFormulario
            key={organizacao.id + organizacao.updatedAt}
            organizacao={organizacao} onCancelar={() => setEditando(false)}
            onSalvo={(item) => { setOrganizacao(item); setEditando(false); setAviso("Cadastro atualizado."); }}
          /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="flex items-center gap-2 font-bold text-white"><ShieldCheck className="h-5 w-5 text-[#d89900]" /> Validação cadastral</h2>
              <p className="text-sm text-zinc-300">Situação: <strong>{ROTULOS_VALIDACAO[organizacao.statusValidacao]}</strong></p>
              <p className="text-xs text-zinc-500">Validação interna não comprova situação na Receita Federal ou habilitação como fornecedor.</p>
              {organizacao.statusValidacao === "REJEITADA" && organizacao.motivoUltimaRejeicao ?
                <p className="text-sm text-amber-300">Motivo: {organizacao.motivoUltimaRejeicao}</p> : null}
              {organizacao.statusValidacao === "PRELIMINAR" ? (
                <div className="space-y-3">
                  <label className="block text-sm text-zinc-300">Motivo de rejeição (somente se rejeitar)
                    <textarea value={motivo} onChange={(event) => setMotivo(event.target.value)}
                      maxLength={2000} rows={2} className={`${inputClass} mt-2`} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={trabalhando}
                      onClick={() => confirmar("Confirmar a validação cadastral interna desta organização?", () => mutacao(`${caminho}/validacao`, "POST", { acao: "VALIDAR" }, "Organização validada internamente."))}
                      className={botaoPrimario}>Validar</button>
                    <button type="button" disabled={trabalhando || !motivo.trim()} onClick={() =>
                      confirmar("Rejeitar a validação interna desta organização?", () => mutacao(`${caminho}/validacao`, "POST", { acao: "REJEITAR", motivo: motivo.trim() }, "Validação rejeitada."))
                    } className={acaoClass}>Rejeitar</button>
                  </div>
                </div>
              ) : (
                <button type="button" disabled={trabalhando} className={acaoClass}
                  onClick={() => confirmar("Retornar a organização ao estado preliminar?", () => mutacao(`${caminho}/validacao`, "POST", { acao: "RETORNAR_PRELIMINAR" }, "Organização retornou ao estado preliminar."))}>
                  Retornar a preliminar
                </button>
              )}
            </section>
            <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="font-bold text-white">Situação operacional</h2>
              <p className="text-sm text-zinc-300">Situação: <strong>{ROTULOS_OPERACAO[organizacao.statusOperacional]}</strong></p>
              <p className="text-xs text-zinc-500">O estado operacional é apenas cadastral e não concede acesso ao Ecossistema.</p>
              <button type="button" disabled={trabalhando} className={acaoClass} onClick={() => {
                const inativar = organizacao.statusOperacional === "ATIVA";
                confirmar(
                  inativar ? "Inativar esta organização? Os vínculos históricos serão preservados." : "Reativar esta organização?",
                  () => mutacao(`${caminho}/operacao`, "POST", { acao: inativar ? "INATIVAR" : "REATIVAR" },
                    inativar ? "Organização inativada." : "Organização reativada."),
                );
              }}>
                {organizacao.statusOperacional === "ATIVA" ? "Inativar organização" : "Reativar organização"}
              </button>
              <p className="text-xs text-zinc-500">E-mail: {organizacao.email || "Não informado"}</p>
              <p className="text-xs text-zinc-500">Telefone: {organizacao.telefone || "Não informado"}</p>
              {organizacao.site ? <a href={organizacao.site} target="_blank" rel="noopener noreferrer"
                className="block break-all text-xs text-[#d89900] underline">{organizacao.site}</a> : null}
              <p className="text-xs text-zinc-500">Cadastro: {formatarDataOrganizacao(organizacao.createdAt)}</p>
            </section>
          </div>
          <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#d89900]" />
              <h2 className="text-lg font-bold text-white">Representantes e contatos</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Vínculos são associados a uma Pessoa existente no MGU. Apenas um vínculo ativo pode ser contato principal.
              O contato principal não recebe permissões administrativas automaticamente.
            </p>
            <SeletorPessoaOrganizacao
              selecionada={pessoaSelecionada}
              onSelecionar={setPessoaSelecionada}
              disabled={trabalhando || organizacao.statusOperacional !== "ATIVA"}
            />
            <form onSubmit={criarVinculo} className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="text-sm text-zinc-300">Função ou relacionamento
                <input value={funcao} onChange={(event) => setFuncao(event.target.value)}
                  maxLength={200} placeholder="Ex.: contato comercial" className={`${inputClass} mt-1`} />
              </label>
              <button type="submit" disabled={trabalhando || !pessoaSelecionada?.id || organizacao.statusOperacional !== "ATIVA"}
                className={`${botaoPrimario} inline-flex items-center justify-center gap-2 self-end`}>
                <Plus className="h-4 w-4" /> Vincular
              </button>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500"><tr>
                  <th className="p-3">Pessoa / vínculo</th><th className="p-3">Função</th><th className="p-3">Status</th><th className="p-3">Principal</th><th className="p-3">Ações</th>
                </tr></thead>
                <tbody className="divide-y divide-zinc-800">
                  {vinculos.map((vinculo) => (
                    <tr key={vinculo.id}>
                      <td className="p-3">
                        <p className="font-semibold text-zinc-200">{vinculo.pessoa?.nome || "Pessoa indisponível"}</p>
                        <p className="mt-1 text-xs text-zinc-400">{vinculo.pessoa?.emailPrincipal || "E-mail indisponível"}</p>
                        {vinculo.pessoa?.ativo === false ? <p className="text-xs text-amber-300">Pessoa inativa</p> : null}
                      </td>
                      <td className="p-3 text-zinc-300">{vinculo.funcao || "Não informada"}</td>
                      <td className="p-3 text-zinc-300">{ROTULOS_VINCULO[vinculo.status] || vinculo.status}</td>
                      <td className="p-3 text-zinc-300">{vinculo.principal ? "Sim" : "Não"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {vinculo.status === "PENDENTE" ? (
                            <button type="button" disabled={trabalhando || vinculo.pessoa?.ativo === false || organizacao.statusOperacional !== "ATIVA"} className={acaoClass}
                              onClick={() => confirmar("Ativar o vínculo desta pessoa?", () => mutacao(`${caminho}/vinculos/${encodeURIComponent(vinculo.id)}/ativar`, "POST", {}, "Vínculo ativado."))}>Ativar</button>
                          ) : null}
                          {vinculo.status === "ATIVO" ? (
                            <button type="button" disabled={trabalhando} className={acaoClass}
                              onClick={() => confirmar("Definir esta pessoa como contato principal?", () => mutacao(`${caminho}/principal`, "PUT", { vinculoId: vinculo.id }, "Contato principal atualizado."))}>
                              {vinculo.principal ? "Principal" : "Definir principal"}
                            </button>
                          ) : null}
                          {vinculo.status !== "ENCERRADO" ? (
                            <button type="button" disabled={trabalhando} className={acaoClass}
                              onClick={() => confirmar("Encerrar o vínculo? O histórico será preservado.", () => mutacao(`${caminho}/vinculos/${encodeURIComponent(vinculo.id)}/encerrar`, "POST", {}, "Vínculo encerrado."))}>Encerrar</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!vinculos.length ? <tr><td colSpan={5} className="p-5 text-center text-zinc-500">Nenhum vínculo nesta página.</td></tr> : null}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-400">
              <span>{vinculosPaginacao?.total ?? 0} vínculos · página {vinculosPagina} de {vinculosPaginacao?.totalPages || 1}</span>
              <div className="flex gap-2">
                <button type="button" className={acaoClass} disabled={trabalhando || vinculosPagina <= 1}
                  onClick={() => setVinculosPagina((p) => Math.max(1, p - 1))}>Anterior</button>
                <button type="button" className={acaoClass} disabled={trabalhando || vinculosPagina >= (vinculosPaginacao?.totalPages || 1)}
                  onClick={() => setVinculosPagina((p) => p + 1)}>Próxima</button>
                <button type="button" className={acaoClass} disabled={trabalhando || carregando}
                  onClick={() => void carregar()} aria-label="Atualizar vínculos"><RefreshCw className="h-4 w-4" /></button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
