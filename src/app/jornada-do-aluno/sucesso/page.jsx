// src/app/jornada-do-aluno/sucesso/page.jsx
import Link from 'next/link';

export default function JornadaSucessoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d89900]">
          Contribuição recebida
        </p>
        <h1 className="mt-4 text-3xl font-black md:text-4xl">
          Obrigado por compartilhar sua jornada.
        </h1>
        <p className="mt-5 leading-relaxed text-zinc-300">
          Sua experiência foi registrada. A equipe poderá entrar em contato caso
          sua história, sugestão ou oportunidade precise de uma conversa mais
          detalhada.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-[#d89900] px-6 py-3 font-bold text-black"
        >
          Voltar ao Garimpo Urbano
        </Link>
      </section>
    </main>
  );
}