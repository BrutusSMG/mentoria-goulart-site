// src/app/(admin)/admin/sucatas/layout.jsx
import { redirect } from "next/navigation";
import { obterAcessoModulo } from "@/lib/admin-permissoes";

export default async function SucatasLayout({ children }) {
  const acesso = await obterAcessoModulo("SUCATAS");

  if (acesso.status === 401) redirect("/admin-login");
  if (!acesso.permitido) redirect("/admin?erro=sem-permissao");

  return children;
}