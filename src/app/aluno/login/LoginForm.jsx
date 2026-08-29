// src/app/aluno/login/page.jsx
'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';

export default function LoginAlunoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  const primeiroAcessoConcluido = searchParams.get('primeiroAcesso') === 'ok';

  async function handleLogin(event) {
    event.preventDefault();
    setErro('');
    setStatus('loading');

    const resultado = await signIn('credentials', {
      area: 'aluno',
      email: email.trim().toLowerCase(),
      password: senha,
      redirect: false,
    });

    if (!resultado?.ok) {
      setStatus('error');
      setErro('E-mail ou senha incorretos, ou sua matrícula ainda não está ativa.');
      return;
    }

    const sessao = await getSession();

    if (sessao?.user?.tipoConta !== 'ALUNO') {
      setStatus('error');
      setErro('Esta conta não possui acesso à área do aluno.');
      return;
    }

    router.replace('/aluno');
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
          Área do aluno
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
          Entre para acessar seus materiais, comunidade e atalhos do curso.
        </p>

        {primeiroAcessoConcluido ? (
          <p className="mt-6 rounded-lg border border-green-500/25 bg-green-500/10 p-3 text-center text-sm text-green-200">
            Senha criada com sucesso. Agora entre com seu e-mail e a nova senha.
          </p>
        ) : null}

        <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              E-mail da compra
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
              Senha do portal
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
                placeholder="Sua senha do portal"
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-4 py-3 text-base font-black text-black transition-all hover:shadow-[0_0_30px_rgba(216,153,0,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
            {status === 'loading' ? 'ENTRANDO...' : 'ENTRAR NA ÁREA DO ALUNO'}
          </button>
          <div className="mt-4 text-center">
            <a href="/aluno/esqueci-senha" className="text-sm text-[#F7FA83] underline-offset-4 hover:underline">
              Esqueci minha senha
            </a>
          </div>

        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-zinc-400">
          <p>O acesso às aulas continua sendo feito na Hotmart.</p>
          <a
            href="https://consumer.hotmart.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[#F7FA83] underline-offset-4 hover:underline"
          >
            Acessar aulas na Hotmart
          </a>
          <p className="pt-2 text-xs text-zinc-600">
            Ainda não recebeu o convite de acesso? Entre em contato com o suporte.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-6 block text-center text-xs text-zinc-500 hover:text-zinc-300"
        >
          Acesso administrativo
        </Link>
      </section>
    </main>
   );
}