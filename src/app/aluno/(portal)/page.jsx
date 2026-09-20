// src/app/aluno/(portal)/page.jsx
import Link from 'next/link';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  alunoTemAcessoAtivo,
  alunoTemContaAtiva,
} from '@/lib/acesso-aluno';
import {
  alunoTemAcessoComunidade,
  nivelAcessoEcossistema,
} from '@/lib/direitos-produto';

const ROTULOS_ECO = {
  NENHUM: 'Nenhum acesso',
  BASICO: 'Básico',
  COMPLETO: 'Completo',
  PREMIUM: 'Premium',
};

export default async function PortalAlunoPage() {
  const sessao = await getServerSession(authOptions);
  const usuario = sessao?.user;

  if (usuario?.tipoConta === 'ADMIN') {
    return (
      <main className="min-h-screen bg-black px-4 py-12 text-white">
        <section className="mx-auto w-full max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">
            Garimpo Urbano
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Portal
          </h1>

          <p className="mt-3 text-zinc-400">
            Acesso administrativo ao ambiente dos participantes.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/aluno/comunidade"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:border-[#d89900]"
            >
              <h2 className="text-xl font-bold">
                Comunidade
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Acesso administrativo.
              </p>
            </Link>
          </div>

          <Link
            href="/admin"
            className="mt-8 inline-flex text-sm text-zinc-400 hover:text-white"
          >
            Voltar para a administração
          </Link>
        </section>
      </main>
    );
  }

  const alunoId = usuario?.alunoId;

  const [
    contaAtiva,
    acessoEducacional,
    acessoComunidade,
    nivelEco,
  ] = await Promise.all([
    alunoTemContaAtiva(alunoId),
    alunoTemAcessoAtivo(alunoId),
    alunoTemAcessoComunidade(alunoId),
    nivelAcessoEcossistema(alunoId),
  ]);

  if (!contaAtiva) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
        <section className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Conta indisponível
          </h1>

          <p className="mt-4 text-sm text-zinc-400">
            Sua conta não está ativa para utilizar o Portal Garimpo Urbano.
          </p>

          <Link
            href="/aluno/login"
            className="mt-6 inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium"
          >
            Voltar para o login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d89900]">
          Garimpo Urbano
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Seu Portal
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-400">
          Acesse os recursos liberados para a sua conta.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/aluno/perfil"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-[#d89900]"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#d89900]">
              Conta
            </p>
            <h2 className="mt-2 text-xl font-bold">
              Meu perfil
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Consulte e atualize seus dados no Portal.
            </p>
          </Link>

          {acessoComunidade ? (
            <Link
              href="/aluno/comunidade"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-[#d89900]"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#d89900]">
                Disponível
              </p>
              <h2 className="mt-2 text-xl font-bold">
                Comunidade
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Seu produto possui acesso à comunidade.
              </p>
            </Link>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 opacity-70">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Não disponível
              </p>
              <h2 className="mt-2 text-xl font-bold">
                Comunidade
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Sua conta não possui este direito no momento.
              </p>
            </div>
          )}

          <Link
            href={
              acessoEducacional
                ? '/aluno/area'
                : '/aluno/acesso-indisponivel'
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-[#d89900]"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#d89900]">
              {acessoEducacional ? 'Disponível' : 'Sem vigência ativa'}
            </p>
            <h2 className="mt-2 text-xl font-bold">
              Área do Aluno
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Acesso educacional vinculado à sua matrícula e vigência.
            </p>
          </Link>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#d89900]">
              EcoMGU
            </p>
            <h2 className="mt-2 text-xl font-bold">
              {ROTULOS_ECO[nivelEco] || nivelEco}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Nível efetivo acumulado pelos direitos ativos da sua conta.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
