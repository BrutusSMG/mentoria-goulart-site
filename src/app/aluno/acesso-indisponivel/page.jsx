// src/app/aluno/acesso-indisponivel/page.jsx
import Link from 'next/link';

export default function AcessoIndisponivelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold">
          Acesso indisponível
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Sua conta está autenticada, mas não possui uma matrícula com
          vigência válida para acessar a Área do Aluno neste momento.
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Se você acredita que isso está incorreto, entre em contato com o
          suporte.
        </p>

        <Link
          href="/aluno/login"
          className="mt-6 inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-900"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}