"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import {
  apiOrganizacoes,
  CAMPOS_ORGANIZACAO_UI,
  camposIniciaisOrganizacao,
} from "@/lib/organizacoes-admin-ui";

export default function OrganizacaoFormulario({ organizacao = null, onSalvo, onCancelar }) {
  const [form, setForm] = useState(() => camposIniciaisOrganizacao(organizacao || {}));
  const [confirmarIdentificacao, setConfirmarIdentificacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const alterar = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro("");
  };

  async function salvar(event) {
    event.preventDefault();
    if (salvando) return;
    if (!form.nomeFantasia.trim() && !form.razaoSocial.trim()) {
      setErro("Informe nome fantasia ou razão social.");
      return;
    }
    const dados = Object.fromEntries(
      CAMPOS_ORGANIZACAO_UI.map(([campo]) => [campo, form[campo].trim() || null]),
    );
    if (dados.site && !dados.site.startsWith("https://")) {
      setErro("O site deve começar com https://");
      return;
    }
    const mudouIdentificacao = Boolean(
      organizacao?.statusValidacao === "VALIDADA" &&
      ["nomeFantasia", "razaoSocial", "cnpj"].some(
        (campo) => (organizacao[campo] || "") !== (dados[campo] || ""),
      ),
    );
    if (mudouIdentificacao && !confirmarIdentificacao) {
      setErro("Confirme explicitamente a mudança de identificação já validada.");
      return;
    }
    if (organizacao && CAMPOS_ORGANIZACAO_UI.every(
      ([campo]) => (organizacao[campo] || "") === (dados[campo] || ""),
    )) {
      setErro("Nenhuma alteração identificada.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const payload = organizacao
        ? { ...dados, ...(mudouIdentificacao ? { reconfirmarValidacao: true } : {}) }
        : dados;
      const resultado = await apiOrganizacoes(
        organizacao
          ? `/api/admin/organizacoes/${encodeURIComponent(organizacao.id)}`
          : "/api/admin/organizacoes",
        { method: organizacao ? "PATCH" : "POST", body: payload },
      );
      onSalvo(resultado.item);
    } catch (error) {
      setErro(error.message || "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-white">
          {organizacao ? "Editar dados cadastrais" : "Cadastrar organização"}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Cadastro empresarial brasileiro. CNPJ opcional, mas obrigatório validar quando informado.
          Esse cadastro não habilita a empresa como fornecedora.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {CAMPOS_ORGANIZACAO_UI.map(([campo, rotulo, maxLength]) => (
          <label key={campo} className={campo === "site" ? "block md:col-span-2" : "block"}>
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">{rotulo}</span>
            <input
              type={campo === "email" ? "email" : campo === "site" ? "url" : "text"}
              autoComplete="off"
              maxLength={maxLength}
              value={form[campo]}
              onChange={(event) => alterar(campo, event.target.value)}
              placeholder={campo === "cnpj" ? "00.000.000/0000-00" : campo === "site" ? "https://exemplo.com.br" : ""}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
            />
          </label>
        ))}
      </div>
      {organizacao?.statusValidacao === "VALIDADA" ? (
        <label className="flex items-start gap-3 rounded-lg border border-amber-700/30 bg-amber-900/10 p-4 text-sm text-zinc-300">
          <input type="checkbox" className="mt-1 accent-[#d89900]" checked={confirmarIdentificacao}
            onChange={(event) => setConfirmarIdentificacao(event.target.checked)} />
          Confirmo as alterações de identificação de uma organização já validada. A decisão cadastral anterior permanecerá registrada.
        </label>
      ) : null}
      {erro ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />{erro}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50">
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {salvando ? "Salvando..." : organizacao ? "Salvar alterações" : "Cadastrar organização"}
        </button>
        <button type="button" onClick={onCancelar} disabled={salvando}
          className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 disabled:opacity-50">
          Cancelar
        </button>
      </div>
    </form>
  );
}
