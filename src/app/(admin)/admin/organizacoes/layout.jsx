import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";
import { obterAcessoAdmin } from "@/lib/admin-permissoes";

export default async function OrganizacoesLayout({ children }) {
  const acesso = await obterAcessoAdmin();
  if (acesso.status === 401) redirect("/login");
  if (!acesso.permitido) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <ShieldX className="mx-auto h-8 w-8 text-red-400" />
        <h1 className="mt-4 text-2xl font-black text-white">Acesso restrito</h1>
        <p className="mt-2 text-sm text-zinc-400">O cadastro de organizações é exclusivo do ADMIN do MGU.</p>
        <Link href="/admin/modulos" className="mt-5 inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200">Voltar ao painel</Link>
      </section>
    );
  }
  return children;
}
