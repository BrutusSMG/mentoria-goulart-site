// src/components/admin/AdminLogoutButton.jsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton({ className = "" }) {
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    setSaindo(true);

    await signOut({
      callbackUrl: "/admin-login",
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={saindo}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {saindo ? "Saindo..." : "Sair do painel"}
    </button>
  );
}