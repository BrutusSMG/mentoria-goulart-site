// src/app/(admin)/admin/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const result = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        

        {/* Card de Login */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#d89900] to-transparent" />

          <h1 className="text-2xl font-black text-white mb-2 text-center">
            Acesso Restrito
          </h1>
          <p className="text-zinc-500 text-sm text-center mb-8">
            Painel Administrativo — Garimpo Urbano
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={status === "loading"}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-black border border-zinc-700 text-white focus:outline-none focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {status === "error" && (
              <p className="text-red-500 text-sm text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20">
                E-mail ou senha incorretos.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-linear-to-r from-[#d89900] to-[#F7FA83] text-black font-black text-base py-3 rounded-lg hover:shadow-[0_0_30px_rgba(216,153,0,0.5)] transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "ENTRAR"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Acesso exclusivo para administradores e parceiros autorizados.
        </p>
      </div>
    </div>
  );
}
