"use client";

import { useState } from "react";
import { apiOrganizacoes } from "@/lib/organizacoes-admin-ui";

const inputClass = "w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]";
const buttonClass = "rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 disabled:opacity-40";

export default function SeletorPessoaOrganizacao({ selecionada, onSelecionar, disabled = false }) {
  const [busca, setBusca] = useState("");
  const [pessoas, setPessoas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [form, setForm] = useState({ nome: "", emailPrincipal: "", telefonePrincipal: "" });

  async function buscar(event) {
    event.preventDefault();
    setErro("");
    setAviso("");
    if (busca.trim().length < 2) {
      setErro("Informe pelo menos dois caracteres.");
      return;
    }
    setCarregando(true);
    try {
      const query = new URLSearchParams({ q: busca.trim(), page: "1", pageSize: "20" });
      const resultado = await apiOrganizacoes(`/api/admin/pessoas?${query}`);
      setPessoas(resultado.items || []);
      if (!resultado.items?.length) setAviso("Nenhuma Pessoa encontrada. Confira antes de criar.");
    } catch (e) { setErro(e.message); } finally { setCarregando(false); }
  }

  async function criar(event) {
    event.preventDefault();
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      const resultado = await apiOrganizacoes("/api/admin/pessoas", {
        method: "POST",
        body: {
          nome: form.nome,
          emailPrincipal: form.emailPrincipal,
          telefonePrincipal: form.telefonePrincipal || null,
        },
      });
      onSelecionar(resultado.item);
      setCriando(false);
      setPessoas([]);
      setAviso("Pessoa criada. Confira os dados antes de vincular.");
    } catch (e) {
      setErro(e.message);
      if (/e-mail.*cadastrado|EMAIL_EM_USO/i.test(e.message)) {
        setCriando(false);
        setBusca(form.emailPrincipal);
        setAviso("Pesquise o e-mail existente e confirme a identidade.");
      }
    } finally { setCarregando(false); }
  }

  return (
    <div className="space-y-3">
      {selecionada ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-700/30 bg-amber-900/10 p-3 text-sm">
          <div>
            <p className="font-semibold text-white">{selecionada.nome}</p>
            <p className="text-zinc-300">{selecionada.emailPrincipal}</p>
          </div>
          <button type="button" disabled={disabled} className={buttonClass}
            onClick={() => onSelecionar(null)}>Trocar Pessoa</button>
        </div>
      ) : null}
      <form onSubmit={buscar} className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1 text-sm text-zinc-300">
          Buscar Pessoa por nome ou e-mail
          <input value={busca} maxLength={120} disabled={disabled}
            onChange={(e) => setBusca(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <button type="submit" disabled={disabled || carregando} className={`${buttonClass} self-end`}>
          {carregando ? "Aguarde..." : "Buscar Pessoa"}
        </button>
      </form>
      {pessoas.length ? (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-zinc-700 p-2">
          {pessoas.map((pessoa) => (
            <button type="button" key={pessoa.id} disabled={disabled || !pessoa.ativo}
              onClick={() => { onSelecionar(pessoa); setPessoas([]); }}
              className="block w-full rounded px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40">
              {pessoa.nome} · {pessoa.emailPrincipal}
              {!pessoa.ativo ? " · Inativa: revisão administrativa necessária" : ""}
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" disabled={disabled || carregando} onClick={() => { setCriando((v) => !v); setErro(""); }}
        className={buttonClass}>{criando ? "Fechar cadastro" : "Cadastrar nova Pessoa"}</button>
      {criando ? (
        <form onSubmit={criar} className="grid gap-3 rounded-lg border border-zinc-700 p-4 md:grid-cols-2">
          <label className="text-sm text-zinc-300">Nome completo *
            <input required minLength={2} maxLength={200} value={form.nome} disabled={disabled || carregando}
              onChange={(e) => setForm((v) => ({ ...v, nome: e.target.value }))} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm text-zinc-300">E-mail principal *
            <input required type="email" maxLength={254} value={form.emailPrincipal} disabled={disabled || carregando}
              onChange={(e) => setForm((v) => ({ ...v, emailPrincipal: e.target.value }))} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm text-zinc-300 md:col-span-2">Telefone / WhatsApp (opcional, não verificado)
            <input maxLength={32} value={form.telefonePrincipal} disabled={disabled || carregando}
              onChange={(e) => setForm((v) => ({ ...v, telefonePrincipal: e.target.value }))} className={`${inputClass} mt-1`} />
          </label>
          <button type="submit" disabled={disabled || carregando}
            className="rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40 md:col-span-2">
            {carregando ? "Salvando..." : "Cadastrar Pessoa"}
          </button>
          <p className="text-xs text-zinc-400 md:col-span-2">Não cria Lead, Aluno, Usuário ou acesso. A vinculação é feita separadamente.</p>
        </form>
      ) : null}
      {erro ? <p role="alert" className="text-sm text-red-300">{erro}</p> : null}
      {aviso ? <p role="status" className="text-sm text-amber-200">{aviso}</p> : null}
    </div>
  );
}
