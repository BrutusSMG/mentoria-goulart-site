// src/app/aluno/primeiro-acesso/page.jsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SENHA_ALUNO_MIN,
  SENHA_ALUNO_MAX,
  senhaAlunoValida,
} from "@/lib/validacoes";

export default function PrimeiroAcessoAlunoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  async function concluirPrimeiroAcesso(event) {
    event.preventDefault();
    setErro('');

    if (!token) {
      setErro('O link de primeiro acesso está incompleto.');
      return;
    }

    if (!senhaAlunoValida(senha)) {
      if (senha.length < SENHA_ALUNO_MIN) {
        setErro(
          `A senha precisa ter pelo menos ${SENHA_ALUNO_MIN} caracteres.`,
        );
      } else {
        setErro(
          `A senha não pode ter mais de ${SENHA_ALUNO_MAX} caracteres.`,
        );
      }

      return;
    }

    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }

    setStatus('loading');

    const resposta = await fetch('/api/alunos/primeiro-acesso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, senha }),
    });

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      setStatus('error');
      setErro(resultado.erro || 'Não foi possível concluir o primeiro acesso.');
      return;
    }

    router.replace('/aluno/login?primeiroAcesso=ok');
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
          Crie a senha que você usará para entrar na área do aluno.
        </p>

        <form onSubmit={concluirPrimeiroAcesso} className="mt-7 flex flex-col gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Nova senha
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={SENHA_ALUNO_MIN}
              maxLength={SENHA_ALUNO_MAX}
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition-colors focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900]"
              placeholder={`Mínimo de ${SENHA_ALUNO_MIN} caracteres`}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-300">
              Confirmar senha
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={SENHA_ALUNO_MIN}
              maxLength={SENHA_ALUNO_MAX}
              value={confirmacao}
              onChange={(event) => setConfirmacao(event.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition-colors focus:border-[#d89900] focus:ring-1 focus:ring-[#d89900]"
              placeholder="Digite novamente"
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
            className="w-full rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-4 py-3 text-base font-black text-black transition-all hover:shadow-[0_0_30px_rgba(216,153,0,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'SALVANDO...' : 'CRIAR MINHA SENHA'}
          </button>
        </form>
      </section>
    </main>
  );
}