// src/app/login/page.jsx
'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { destinoInicialDoUsuario } from '@/lib/destino-pos-login';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  const mensagemInicial = searchParams.get('senha') === 'atualizada'
    ? 'Senha atualizada. Entre novamente com a nova senha.'
    : '';

  async function handleLogin(event) {
    event.preventDefault();
    setErro('');
    setStatus('loading');

    const dadosLogin = {
      email: email.trim().toLowerCase(),
      password: senha,
      redirect: false,
    };

    let resultado = await signIn('credentials', {
      ...dadosLogin,
      area: 'admin',
    });

    if (!resultado?.ok) {
      resultado = await signIn('credentials', {
        ...dadosLogin,
        area: 'aluno',
      });
    }

    if (!resultado?.ok) {
      setStatus('error');
      setErro('E-mail ou senha incorretos.');
      return;
    }

   const sessao = await getSession();

    if (sessao?.user?.mustChangePassword) {
      router.replace('/alterar-senha');
      return;
    }

    router.replace(destinoInicialDoUsuario(sessao?.user));

  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#d89900]/15 text-[#d89900]">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">
          Garimpo Urbano
        </p>
        <h1 className="mt-2 text-center text-3xl font-black">
          Acesse sua conta
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
          Entre para continuar no Garimpo Urbano.
        </p>

        {mensagemInicial ? (
          <p className="mt-6 rounded-lg border border-green-500/25 bg-green-500/10 p-3 text-center text-sm text-green-200">
            {mensagemInicial}
          </p>
        ) : null}

        <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              E-mail
            </span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={status === 'loading'}
                className="w-full rounded-lg border border-zinc-700 bg-black py-3 pl-10 pr-4 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900]"
                placeholder="seu@email.com"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Senha
            </span>
            <span className="relative block">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                disabled={status === 'loading'}
                className="w-full rounded-lg border border-zinc-700 bg-black py-3 pl-10 pr-4 text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900]"
                placeholder="Sua senha"
              />
            </span>
          </label>

          {erro ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-200">
              {erro}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#d89900] to-[#F7FA83] px-4 py-3 text-base font-black text-black transition-all hover:shadow-[0_0_30px_rgba(216,153,0,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : null}
            {status === 'loading' ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-600">
          O acesso será direcionado conforme o perfil da sua conta.
        </p>
      </section>
    </main>
  );
}
