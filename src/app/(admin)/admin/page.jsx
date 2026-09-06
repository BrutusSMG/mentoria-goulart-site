// src/app/(admin)/admin/page.jsx
import { redirect } from "next/navigation";
import { obterAcessoAtual } from "@/lib/admin-permissoes";
import { destinoInicialDoUsuario } from "@/lib/destino-pos-login";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const acesso = await obterAcessoAtual();

  if (!acesso.permitido) {
    if (acesso.status === 401) {
      redirect("/login");
    }

    redirect("/login?erro=conta-inativa");
  }

  if (acesso.conta.role !== "ADMIN") {
    redirect(destinoInicialDoUsuario(acesso.conta));
  }

  return <AdminDashboardClient />;
}
