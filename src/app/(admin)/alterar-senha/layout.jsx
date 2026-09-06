// src/app/(admin)/alterar-senha/layout.jsx
import { redirect } from "next/navigation";
import { obterAcessoAtual } from "@/lib/admin-permissoes";

export default async function AlterarSenhaLayout({ children }) {
  const acesso = await obterAcessoAtual();

  if (!acesso.permitido) {
    redirect("/login");
  }

  if (!acesso.conta.mustChangePassword) {
    redirect("/admin");
  }

  return children;
}