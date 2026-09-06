// src/app/(admin)/admin/transacoes/layout.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { obterAcessoAdmin } from "@/lib/admin-permissoes";

export default async function TransacoesLayout({ children }) {
  const acesso = await obterAcessoAdmin();

  if (acesso.status === 401) {
    redirect("/login");
  }

  if (!acesso.permitido) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <ShieldX className="h-6 w-6 text-red-400" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-red-300">
            Acesso restrito
          </p>

          <h1 className="mt-2 text-2xl font-black text-white">
            Este módulo é exclusivo para administradores.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Sua conta não possui permissão para visualizar as transações do painel.
          </p>

          <Link
            href="/admin/modulos"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-zinc-200 transition-colors hover:border-[#d89900] hover:text-[#d89900]"
          >
            Voltar aos módulos
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
