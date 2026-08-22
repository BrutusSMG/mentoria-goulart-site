// src/components/admin/AdminLogoutButton.jsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton({
  className = "",
  compact = false,
  title,
  ariaLabel,
}) {
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    setSaindo(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  const rotulo = saindo ? "Saindo do painel" : "Sair do painel";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={saindo}
      title={title || (compact ? rotulo : undefined)}
      aria-label={ariaLabel || rotulo}
      className={`inline-flex items-center justify-center rounded-lg border border-zinc-800 text-sm font-semibold text-zinc-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${
        compact
          ? "h-10 w-10 p-0"
          : "min-h-11 gap-2 px-3 py-2.5"
      } ${className}`}
    >
      {compact ? (
        <LogOut className="h-4 w-4 shrink-0" />
      ) : (
        <>
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{saindo ? "Saindo..." : "Sair do painel"}</span>
        </>
      )}
    </button>

  );
}