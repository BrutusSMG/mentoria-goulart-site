// src/app/(admin)/admin/layout.jsx
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/admin-permissoes";
import AdminMobileNavigation from "@/components/admin/AdminMobileNavigation";
import Image from "next/image";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const LINKS_DESKTOP = {
  dashboard: "Dashboard",
  leads: "Leads",
  transacoes: "Transações",
  usuarios: "Usuários",
  sucatas: "Valores de Sucata",
  depoimentos: "Depoimentos",
};

function classeDoLinkDesktop(ativo = false) {
  return `block rounded-lg p-3 text-sm font-medium transition-colors ${
    ativo
      ? "bg-zinc-900 text-white"
      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
  }`;
}

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const contaAtual = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: {
      nome: true,
      role: true,
      ativo: true,
      mustChangePassword: true,
      podeGerenciarSucatas: true,
      podeGerenciarDepoimentos: true,
    },
  });

  if (!contaAtual?.ativo) {
    redirect("/admin-login?erro=conta-inativa");
  }

  if (contaAtual.mustChangePassword) {
    redirect("/alterar-senha");
  }

  const ehAdmin = contaAtual.role === "ADMIN";
  const podeVerSucatas = ehAdmin || contaAtual.podeGerenciarSucatas;
  const podeVerDepoimentos = ehAdmin || contaAtual.podeGerenciarDepoimentos;

  const itensNavegacao = [];

  if (ehAdmin) {
    itensNavegacao.push(
      { href: "/admin", rotulo: LINKS_DESKTOP.dashboard, icone: "dashboard" },
      { href: "/admin/leads", rotulo: LINKS_DESKTOP.leads, icone: "leads" },
      { href: "/admin/transacoes", rotulo: LINKS_DESKTOP.transacoes, icone: "transacoes" },
      { href: "/admin/usuarios", rotulo: LINKS_DESKTOP.usuarios, icone: "usuarios" },
    );
  }

  if (podeVerSucatas) {
    itensNavegacao.push({
      href: "/admin/sucatas",
      rotulo: LINKS_DESKTOP.sucatas,
      icone: "sucatas",
    });
  }

  if (podeVerDepoimentos) {
    itensNavegacao.push({
      href: "/admin/depoimentos",
      rotulo: LINKS_DESKTOP.depoimentos,
      icone: "depoimentos",
    });
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-white md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-900 bg-black md:flex">
        <div className="border-b border-zinc-900 p-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo_fundoTransparentered.png"
              alt="Garimpo Urbano"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-[#d89900]">Garimpo Urbano</h2>
              <p className="text-xs text-zinc-500">Painel Administrativo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4" aria-label="Navegação administrativa">
          <ul className="space-y-2">
            {itensNavegacao.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={classeDoLinkDesktop(item.href === "/admin")}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-zinc-900 p-4">
          <p className="truncate text-sm text-zinc-400">{contaAtual.nome}</p>
          <p className="mt-1 text-xs text-zinc-600">{contaAtual.role}</p>
          <AdminLogoutButton className="mt-4 w-full" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <AdminMobileNavigation items={itensNavegacao} usuario={contaAtual} />

        <header className="hidden h-16 items-center border-b border-zinc-900 bg-black px-6 md:flex">
          <h1 className="text-lg font-bold">Visão Geral</h1>
        </header>

        <div className="w-full p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}