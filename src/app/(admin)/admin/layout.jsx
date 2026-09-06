// src/app/(admin)/admin/layout.jsx
import { redirect } from "next/navigation";
import Image from "next/image";
import { obterAcessoAtual } from "@/lib/admin-permissoes";
import AdminDesktopNavigation from "@/components/admin/AdminDesktopNavigation";
import AdminMobileNavigation from "@/components/admin/AdminMobileNavigation";

const LINKS_DESKTOP = {
  dashboard: "Dashboard",
  leads: "Leads",
  transacoes: "Transações",
  usuarios: "Usuários",
  sucatas: "Valores de Sucata",
  depoimentos: "Depoimentos",
  jornada: "Jornada do Aluno",
  aluno: "Área do Aluno",
  alunos: "Alunos",
};

export default async function AdminLayout({ children }) {
  const acesso = await obterAcessoAtual();

  if (!acesso.permitido) {
    if (acesso.status === 401) {
      redirect("/login");
    }

    redirect("/login?erro=conta-inativa");
  }

  const contaAtual = acesso.conta;

  if (contaAtual.mustChangePassword) {
    redirect("/alterar-senha");
  }

  const ehAdmin = contaAtual.role === "ADMIN";
  const podeVerSucatas = ehAdmin || contaAtual.podeGerenciarSucatas;
  const podeVerDepoimentos =
    ehAdmin || contaAtual.podeGerenciarDepoimentos;
  const podeVerJornada = ehAdmin || contaAtual.podeGerenciarJornada;

  const itensNavegacao = [];

  if (ehAdmin) {
    itensNavegacao.push(
      { href: "/admin", rotulo: LINKS_DESKTOP.dashboard, icone: "dashboard" },
      { href: "/admin/leads", rotulo: LINKS_DESKTOP.leads, icone: "leads" },
      {
        href: "/admin/transacoes",
        rotulo: LINKS_DESKTOP.transacoes,
        icone: "transacoes",
      },
      {
        href: "/admin/usuarios",
        rotulo: LINKS_DESKTOP.usuarios,
        icone: "usuarios",
      },

      {
        href: "/admin/alunos",
        rotulo: LINKS_DESKTOP.alunos,
        icone: "alunos",
      },

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

  if (podeVerJornada) {
    itensNavegacao.push({
      href: "/admin/jornada",
      rotulo: LINKS_DESKTOP.jornada,
      icone: "jornada",
    });
  }

  if (ehAdmin) {
    itensNavegacao.push({
      href: "/aluno",
      rotulo: LINKS_DESKTOP.aluno,
      icone: "usuarios",
    });
  }
  

  return (
    <div className="min-h-dvh bg-zinc-950 text-white md:flex">
      <AdminDesktopNavigation items={itensNavegacao} usuario={contaAtual} />

      <main className="min-w-0 flex-1">
        <AdminMobileNavigation items={itensNavegacao} usuario={contaAtual} />

        <header className="hidden h-40 items-center justify-center border-b border-zinc-900 bg-black md:flex">
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/logo_fundoTransparentered.png"
              alt="Garimpo Urbano"
              width={128}
              height={128}
              className="h-32 w-32 object-contain"
            />
            <p className="-mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Painel Administrativo
            </p>
          </div>
        </header>

        <div className="w-full p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}