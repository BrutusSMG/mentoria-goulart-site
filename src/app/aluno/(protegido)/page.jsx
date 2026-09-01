// src/app/aluno/(protegido)/page.jsx
import Link from 'next/link';

export default function AreaAlunoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">
          Garimpo Urbano
        </p>
        <h1 className="mt-3 text-3xl font-black">Área do aluno</h1>
        <p className="mt-4 text-zinc-400">
          Acesse suas aulas na Hotmart ou complete seu perfil para se conectar com outros alunos.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3">
          <a
            href="https://consumer.hotmart.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-lg bg-gradient-to-r from-[#d89900] to-[#F7FA83] px-5 py-3 font-black text-black"
          >
            Acessar aulas na Hotmart
          </a>

          <Link
            href="/aluno/perfil"
            className="inline-flex rounded-lg border border-zinc-700 px-5 py-3 font-bold text-white hover:border-[#d89900]"
          >
            Editar meu perfil
          </Link>

          <Link
            href="/aluno/comunidade"
            className="inline-flex rounded-lg border border-zinc-700 px-5 py-3 font-bold text-white hover:border-[#d89900]"
          >
            Conhecer a comunidade
          </Link>

        </div>
        <Link href="/aluno/login" className="mt-5 block text-sm text-zinc-500 hover:text-zinc-300">
          Voltar para o login
        </Link>
      </section>
    </main>
   );
}