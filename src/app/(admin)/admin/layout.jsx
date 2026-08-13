// src/app/(admin)/admin/layout.jsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/admin-permissoes";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  // Consulta o banco a cada navegação para respeitar imediatamente
  // desativação, mudança de perfil e permissões por módulo.
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="w-64 bg-black border-r border-zinc-900 flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-900">
          <h2 className="text-[#d89900] font-bold text-xl">Garimpo Urbano</h2>
          <p className="text-xs text-zinc-500">Painel Administrativo</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {ehAdmin ? (
              <>
                <li>
                  <a href="/admin" className="block p-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/admin/leads" className="block p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    Leads
                  </a>
                </li>
                <li>
                  <a href="/admin/transacoes" className="block p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    Transações
                  </a>
                </li>
                <li>
                  <a href="/admin/usuarios" className="block p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                    Usuários
                  </a>
                </li>
              </>
            ) : null}

            {podeVerSucatas ? (
              <li>
                <a href="/admin/sucatas" className="block p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                  Valores de Sucata
                </a>
              </li>
            ) : null}

            {podeVerDepoimentos ? (
              <li>
                <a href="/admin/depoimentos" className="block p-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                  Depoimentos
                </a>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <p className="text-sm text-zinc-400">{contaAtual.nome}</p>
          <p className="text-xs text-zinc-600">{contaAtual.role}</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-black border-b border-zinc-900 flex items-center px-6 shrink-0">
          <h1 className="font-bold text-lg">Visão Geral</h1>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}