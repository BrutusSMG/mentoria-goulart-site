// src/app/(admin)/admin/depoimentos/layout.jsx
import { redirect } from "next/navigation";
import { obterAcessoModulo } from "@/lib/admin-permissoes";

export default async function DepoimentosLayout({ children }) {
  const acesso = await obterAcessoModulo("DEPOIMENTOS");

  if (acesso.status === 401) redirect("/admin-login");
  if (!acesso.permitido) redirect("/admin?erro=sem-permissao");

  return children;
}
