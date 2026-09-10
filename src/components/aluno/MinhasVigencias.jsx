// src/components/aluno/MinhasVigencias.jsx
'use client';

import { CalendarDays, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatarData(data) {
  if (!data) {
    return null;
  }

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(valor);
}

function rotuloSituacao(situacao) {
  const rotulos = {
    ATIVA: 'Ativa',
    AGENDADA: 'Agendada',
    EXPIRADA: 'Expirada',
    SUSPENSA: 'Suspensa',
    CANCELADA: 'Cancelada',
    ENCERRADA: 'Encerrada',
    PENDENTE: 'Pendente',
    INDEFINIDA: 'Indefinida',
  };

  return rotulos[situacao] || situacao || 'Indefinida';
}

function classeSituacao(situacao) {
  if (situacao === 'ATIVA') {
    return 'border-green-500/20 bg-green-500/10 text-green-300';
  }

  if (situacao === 'AGENDADA' || situacao === 'PENDENTE') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
  }

  if (
    situacao === 'EXPIRADA' ||
    situacao === 'CANCELADA' ||
    situacao === 'ENCERRADA'
  ) {
    return 'border-red-500/20 bg-red-500/10 text-red-300';
  }

  if (situacao === 'SUSPENSA') {
    return 'border-orange-500/20 bg-orange-500/10 text-orange-300';
  }

  return 'border-zinc-700 bg-zinc-800 text-zinc-300';
}

function textoTermino(vigencia) {
  if (vigencia.tipoDuracao === 'VITALICIA') {
    return 'Vitalício';
  }

  const data = formatarData(vigencia.expiraEm);

  if (data) {
    return data;
  }

  return 'Sem vencimento definido';
}

export default function MinhasVigencias() {
  const [vigencias, setVigencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch(
          '/api/alunos/minhas-vigencias',
          {
            cache: 'no-store',
          },
        );

        const corpo = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            corpo.erro ||
              'Não foi possível carregar suas vigências.',
          );
        }

        if (ativo) {
          setVigencias(corpo.vigencias || []);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error?.message ||
              'Não foi possível carregar suas vigências.',
          );
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-[#d89900]" />
      </div>
    );
  }

  if (erro) {
    return (
      <p className="text-sm text-red-300">
        {erro}
      </p>
    );
  }

  if (!vigencias.length) {
    return (
      <p className="text-sm text-zinc-500">
        Nenhuma vigência encontrada para sua conta.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {vigencias.map((vigencia) => (
        <article
          key={vigencia.id}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Produto
              </p>

              <h3 className="mt-1 font-bold text-white">
                {vigencia.produtoNome || 'Produto não informado'}
              </h3>
            </div>

            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${classeSituacao(
                vigencia.situacao,
              )}`}
            >
              {rotuloSituacao(vigencia.situacao)}
            </span>
          </div>

          <div className="mt-5 grid gap-4 border-t border-zinc-800 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Início
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
                <CalendarDays className="h-4 w-4 text-[#d89900]" />
                {formatarData(vigencia.iniciaEm) ||
                  'Não informado'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Término
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm text-zinc-300">
                <CalendarDays className="h-4 w-4 text-[#d89900]" />
                {textoTermino(vigencia)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
