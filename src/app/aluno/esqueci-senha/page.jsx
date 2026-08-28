// src/app/aluno/esqueci-senha/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EsqueciSenhaAlunoPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  async function solicitarRecuperacao(event) {
    event.preventDefault();
    setErro('');
    setStatus('loading');

    try {
      const resposta = await fetch('/api/alunos/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!resposta.ok) throw new Error('Falha na solicitação');
      setStatus('success');
    } catch {
      setStatus('error');
      setErro('Não foi possível processar a solicitação. Tente novamente.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">Garimpo Urbano</p>
        <h1 className="mt-2 text-center text-3xl font-black">Recuperar senha</h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
          Informe o e-mail usado na sua conta. Se houver um cadastro, enviaremos um link para criar uma nova senha.
        </p>

        {status === 'success' ? (
          <p className="mt-6 rounded-lg border border-green-500/25 bg-green-500/10 p-4 text-center text-sm text-green-200">
            Se houver uma conta para este e-mail, as instruções foram enviadas. Verifique sua caixa de entrada e o spam.
          </p>
        ) : (
          <form onSubmit={solicitarRecuperacao} className="mt-7 flex flex-col gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">E-mail da conta</span>
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

            {erro ? <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-200">{erro}</p> : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-4 py-3 font-black text-black disabled:opacity-70"
            >
              {status === 'loading' ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
            </button>
          </form>
        )}

        <Link href="/aluno/login" className="mt-6 block text-center text-sm text-zinc-500 hover:text-zinc-300">
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}