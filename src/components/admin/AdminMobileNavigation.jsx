// src/components/admin/AdminMobileNavigation.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import {
  BarChart3,
  ClipboardList,
  Database,
  FileText,
  GraduationCap,
  Menu,
  ReceiptText,
  Users,
  X,
} from "lucide-react";

const ICONES = {
  dashboard: BarChart3,
  leads: Users,
  transacoes: ReceiptText,
  usuarios: Users,
  sucatas: Database,
  depoimentos: FileText,
  jornada: ClipboardList,
  alunos: GraduationCap,
};

function linkAtivo(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminMobileNavigation({ items, usuario }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return undefined;

    const fecharComEscape = (event) => {
      if (event.key === "Escape") setAberto(false);
    };

    document.addEventListener("keydown", fecharComEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-zinc-900 bg-black/95 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu administrativo"
          aria-expanded={aberto}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 text-zinc-200 transition-colors hover:border-[#d89900] hover:text-[#d89900]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2 text-center">
          <Image
            src="/logo_fundoTransparentered.png"
            alt="Garimpo Urbano"
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 object-contain"
          />
          <p className="-mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
            Painel Administrativo
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d89900]/30 bg-[#d89900]/10 text-sm font-bold text-[#d89900]">
          {usuario.nome?.trim().charAt(0).toUpperCase() || "U"}
        </div>
      </header>

      {aberto ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu administrativo">
          <button
            type="button"
            aria-label="Fechar menu administrativo"
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-black shadow-2xl shadow-black/70">
            <div className="flex items-start justify-between border-b border-zinc-900 p-5">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-[#d89900]">Garimpo Urbano</h2>
                <p className="mt-1 text-xs text-zinc-500">Painel Administrativo</p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4" aria-label="Navegação administrativa">
              <ul className="space-y-2">
                {items.map((item) => {
                  const Icone = ICONES[item.icone] || BarChart3;
                  const ativo = linkAtivo(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setAberto(false)}
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                          ativo
                            ? "bg-[#d89900]/15 text-[#d89900] ring-1 ring-[#d89900]/30"
                            : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        }`}
                      >
                        <Icone className="h-5 w-5 shrink-0" />
                        <span>{item.rotulo}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-zinc-900 p-4">
              <p className="truncate text-sm text-zinc-300">{usuario.nome}</p>
              <p className="mt-1 text-xs font-medium text-[#d89900]">{usuario.role}</p>
              <AdminLogoutButton className="mt-4 w-full" />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}