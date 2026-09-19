// src/components/homepage/HomepageHero.jsx

import Link from 'next/link';

import CotacoesTicker from './CotacoesTicker';

export default function HomepageHero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-black pb-24 pt-0 text-center text-white md:pb-40">
      <CotacoesTicker />

      <div
        className="pointer-events-none absolute inset-0 z-0 mt-16 bg-[radial-gradient(ellipse_at_top,rgba(216,153,0,0.2)_0%,rgba(0,0,0,0)_60%)]"
        aria-hidden="true"
      />

      <div className="container relative z-10 mx-auto px-4 pt-20 md:pt-32">
        <h1 className="mb-4 text-4xl font-extrabold leading-tight md:text-6xl">
          Transforme resíduos eletrônicos em ativos valiosos.
        </h1>

        <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-300 md:text-2xl">
          Um portal de aprendizado sobre recuperação de metais preciosos e empreendedorismo sustentável.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/mentoria"
            className="rounded-lg bg-[#d89900] px-8 py-3 text-lg font-bold text-black transition-colors hover:bg-[#F7FA83]"
          >
            Conheça a Mentoria
          </Link>

          <Link
            href="/produtos"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-zinc-700"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    </section>
  );
}
