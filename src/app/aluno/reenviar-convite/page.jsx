// src/app/aluno/reenviar-convite/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReenviarConviteAlunoPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  async function solicitarNovoConvite(event) {
    event.preventDefault();
    setErro('');
    setStatus('loading');

    try {
      const resposta = await fetch('/api/alunos/reenviar-convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!resposta.ok) {
        throw new Error('Falha na solicitação');
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErro(
        'Não foi possível processar a solicitação. Tente novamente.',
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">
          Garimpo Urbano
        </p>

        <h1 className="mt-2 text-center text-3xl font-black">
          Primeiro acesso
        </h1>

        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
          Não recebeu seu convite ou o link expirou? Informe o e-mail
          cadastrado para solicitar um novo link de primeiro acesso.
        </p>

        {status === 'success' ? (
          <p className="mt-6 rounded-lg border border-green-500/25 bg-green-500/10 p-4 text-center text-sm text-green-200">
            Se houver uma conta elegível para este e-mail, um novo
            convite será enviado. Verifique sua caixa de entrada e o
            spam.
          </p>
        ) : (
          <form
            onSubmit={solicitarNovoConvite}
            className="mt-7 flex flex-col gap-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">
                E-mail da conta
              </span>

              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={status === 'loading'}
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition-colors focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900]"
                placeholder="seu@email.com"
              />
            </label>

            {erro ? (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-200">
                {erro}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-4 py-3 font-black text-black disabled:opacity-70"
            >
              {status === 'loading'
                ? 'ENVIANDO...'
                : 'REENVIAR CONVITE'}
            </button>
          </form>
        )}

        <Link
          href="/aluno/login"
          className="mt-6 block text-center text-sm text-zinc-500 hover:text-zinc-300"
        >
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}