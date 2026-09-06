// src/app/(admin)/alterar-senha/page.jsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { CheckCircle2, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  SENHA_ADMIN_MIN,
  senhaAdminValida,
} from "@/lib/validacoes";

export default function AlterarSenhaPage() {
  const [senhaTemporaria, setSenhaTemporaria] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function salvar(event) {
    event.preventDefault();
    setErro("");

    if (!senhaAdminValida(novaSenha)) {
      setErro(
        `A nova senha deve ter no mínimo ${SENHA_ADMIN_MIN} caracteres.`,
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação da nova senha não confere.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch("/api/admin/alterar-minha-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaTemporaria, novaSenha, confirmarSenha }),
      });
      const payload = await resposta.json();

      if (!resposta.ok) {
        throw new Error(payload.error || "Não foi possível atualizar a senha.");
      }

      setConcluido(true);
      setTimeout(() => {
        void signOut({ callbackUrl: "/login?senha=atualizada" });
      }, 1600);
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar a senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d89900]/15 text-[#d89900]">
          <LockKeyhole className="h-6 w-6" />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#d89900]">Primeiro acesso</p>
        <h1 className="mt-2 text-3xl font-black">Defina sua senha</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Por segurança, a senha temporária precisa ser substituída antes de você acessar o painel.
        </p>

        {concluido ? (
          <div className="mt-7 rounded-xl border border-green-500/25 bg-green-500/10 p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-400" />
            <h2 className="mt-3 font-bold text-green-200">Senha atualizada</h2>
            <p className="mt-2 text-sm text-green-100/80">Você será direcionado para entrar novamente com a nova senha.</p>
          </div>
        ) : (
          <form onSubmit={salvar} className="mt-7 space-y-4">
            <CampoSenha label="Senha temporária" value={senhaTemporaria} onChange={setSenhaTemporaria} autoComplete="current-password" />
            <CampoSenha label="Nova senha" value={novaSenha} onChange={setNovaSenha} autoComplete="new-password" />
            <CampoSenha label="Confirmar nova senha" value={confirmarSenha} onChange={setConfirmarSenha} autoComplete="new-password" />

            <div className="flex gap-2 rounded-lg border border-zinc-800 bg-black/40 p-3 text-xs leading-relaxed text-zinc-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#d89900]" />
              <p>
                Use pelo menos {SENHA_ADMIN_MIN} caracteres e não repita a senha
                temporária recebida.
              </p>
            </div>

            {erro ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{erro}</p> : null}

            <button type="submit" disabled={salvando} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-3 font-bold text-black transition-colors hover:bg-[#F7FA83] disabled:cursor-not-allowed disabled:opacity-60">
              {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
              {salvando ? "Atualizando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function CampoSenha({ label, value, onChange, autoComplete }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
      <input
        type="password"
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none transition-colors focus:border-[#d89900]"
      />
    </label>
  );
}