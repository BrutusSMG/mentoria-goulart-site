// src/components/admin/AdminDesktopNavigation.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  Database,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Users,
} from "lucide-react";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

const ICONES = {
  dashboard: BarChart3,
  leads: Users,
  transacoes: ReceiptText,
  usuarios: Users,
  sucatas: Database,
  depoimentos: FileText,
  jornada: ClipboardList,
};

function linkAtivo(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminDesktopNavigation({ items, usuario }) {
  const pathname = usePathname();
  const [retraida, setRetraida] = useState(false);

  return (
    <aside
      className={`hidden min-h-dvh shrink-0 flex-col border-r border-zinc-900 bg-black transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex ${
        retraida ? "w-[84px]" : "w-64"
      }`}
    >
      <div
        className={`flex h-20 items-center border-b border-zinc-900 ${
          retraida ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        {!retraida ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d89900]">
              Navegação
            </p>
            <p className="mt-1 text-xs text-zinc-500">Garimpo Urbano</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setRetraida((estadoAtual) => !estadoAtual)}
          aria-label={retraida ? "Expandir menu administrativo" : "Retrair menu administrativo"}
          title={retraida ? "Expandir menu" : "Retrair menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300 transition-colors hover:border-[#d89900] hover:text-[#d89900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d89900]"
        >
          {retraida ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação administrativa">
        <ul className="space-y-2">
          {items.map((item) => {
            const Icone = ICONES[item.icone] || BarChart3;
            const ativo = linkAtivo(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={retraida ? item.rotulo : undefined}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d89900] ${
                    retraida ? "justify-center px-2" : "gap-3 px-3"
                  } ${
                    ativo
                      ? "bg-[#d89900]/15 text-[#d89900] ring-1 ring-[#d89900]/30"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icone className="h-5 w-5 shrink-0" />
                  {!retraida ? <span className="truncate">{item.rotulo}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t border-zinc-900 p-4 ${retraida ? "flex flex-col items-center" : ""}`}>
        {!retraida ? (
          <>
            <p className="truncate text-sm text-zinc-300">{usuario.nome}</p>
            <p className="mt-1 text-xs font-medium text-[#d89900]">{usuario.role}</p>
            <AdminLogoutButton className="mt-4 w-full" />
          </>
        ) : (
          <AdminLogoutButton
            compact
            title="Sair do painel"
            ariaLabel="Sair do painel"
            className="h-10 w-10"
          />
        )}
      </div>
    </aside>
  );
}