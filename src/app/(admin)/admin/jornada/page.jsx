// src/app/(admin)/admin/jornada/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  UsersRound,
} from 'lucide-react';

const STATUS_VINCULO = {
  AUTODECLARADO: { label: 'Autodeclarado', className: 'bg-blue-500/15 text-blue-300' },
  PENDENTE_VERIFICACAO: { label: 'Pendente', className: 'bg-amber-500/15 text-amber-300' },
  ALUNO_CONFIRMADO: { label: 'Aluno confirmado', className: 'bg-green-500/15 text-green-300' },
  DIVERGENCIA: { label: 'Divergência', className: 'bg-red-500/15 text-red-300' },
  NAO_LOCALIZADO: { label: 'Não localizado', className: 'bg-zinc-700 text-zinc-300' },
};

const STATUS_OPERACIONAL = {
  NOVA_RESPOSTA: { label: 'Nova resposta', className: 'bg-purple-500/15 text-purple-300' },
  EM_ANALISE: { label: 'Em análise', className: 'bg-blue-500/15 text-blue-300' },
  AGUARDANDO_CONTATO: { label: 'Aguardando contato', className: 'bg-amber-500/15 text-amber-300' },
  ENTREVISTA_AGENDADA: { label: 'Entrevista agendada', className: 'bg-cyan-500/15 text-cyan-300' },
  EM_PRODUCAO: { label: 'Em produção', className: 'bg-orange-500/15 text-orange-300' },
  ENCAMINHADA_PRODUTO: { label: 'Encaminhada ao produto', className: 'bg-pink-500/15 text-pink-300' },
  CONCLUIDA: { label: 'Concluída', className: 'bg-green-500/15 text-green-300' },
  ARQUIVADA: { label: 'Arquivada', className: 'bg-zinc-700 text-zinc-300' },
};

const CAMINHOS = {
  HISTORIA: 'História',
  CASE: 'Resultado / case',
  MELHORIA: 'Melhoria',
  NOVO_CONTEUDO: 'Novo conteúdo',
  PARCERIA: 'Parceria',
  OUTRO: 'Outro',
};

function formatarData(data) {
  if (!data) return 'Não informado';

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return 'Não informado';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(valor);
}

function Badge({ children, className = 'bg-zinc-800 text-zinc-300' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function StatusBadge({ mapa, valor }) {
  const status = mapa[valor] || {
    label: valor || 'Não informado',
    className: 'bg-zinc-800 text-zinc-400',
  };

  return <Badge className={status.className}>{status.label}</Badge>;
}

export default function JornadaAdminPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [statusVinculo, setStatusVinculo] = useState('');
  const [statusOperacional, setStatusOperacional] = useState('');
  const [caminho, setCaminho] = useState('');
  const [page, setPage] = useState(1);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '25',
    });

    if (buscaAplicada) params.set('q', buscaAplicada);
    if (statusVinculo) params.set('statusVinculo', statusVinculo);
    if (statusOperacional) params.set('statusOperacional', statusOperacional);
    if (caminho) params.set('caminho', caminho);

    return params.toString();
  }, [page, buscaAplicada, statusVinculo, statusOperacional, caminho]);

  useEffect(() => {
    let ativo = true;

    async function carregarContatos() {
      try {
        setErro('');
        const resposta = await fetch(`/api/admin/jornada/contatos?${queryString}`, {
          cache: 'no-store',
        });
        const payload = await resposta.json();

        if (!resposta.ok) {
          throw new Error(payload.error || 'Não foi possível carregar a Jornada.');
        }

        if (ativo) setDados(payload);
      } catch (error) {
        if (ativo) setErro(error.message || 'Não foi possível carregar a Jornada.');
      } finally {
        if (ativo) setLoading(false);
      }
    }

    setLoading(true);
    void carregarContatos();

    return () => {
      ativo = false;
    };
  }, [queryString]);

  function aplicarBusca(event) {
    event.preventDefault();
    setPage(1);
    setBuscaAplicada(busca.trim());
  }

  function alterarFiltro(setter, valor) {
    setPage(1);
    setter(valor);
  }

  function limparFiltros() {
    setBusca('');
    setBuscaAplicada('');
    setStatusVinculo('');
    setStatusOperacional('');
    setCaminho('');
    setPage(1);
  }

  const contatos = dados?.contatos || [];
  const total = dados?.pagination?.total || 0;
  const pagina = dados?.pagination?.page || 1;
  const totalPages = Math.max(dados?.pagination?.totalPages || 1, 1);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#d89900]">
            Escuta dos alunos
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">Jornada do Aluno</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-500">
            Consulte contribuições, acompanhe o histórico de cada contato e organize a triagem interna.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
          <UsersRound className="h-4 w-4 text-[#d89900]" />
          <span>{total.toLocaleString('pt-BR')} contato{total === 1 ? '' : 's'}</span>
        </div>
      </div>

      <form
        onSubmit={aplicarBusca}
        className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-[1fr_190px_190px_190px_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Buscar contato</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#d89900]"
            placeholder="Buscar por nome ou e-mail"
          />
        </label>

        <label>
          <span className="sr-only">Status do vínculo</span>
          <select
            value={statusVinculo}
            onChange={(event) => alterarFiltro(setStatusVinculo, event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="">Todos os vínculos</option>
            {Object.entries(STATUS_VINCULO).map(([valor, status]) => (
              <option key={valor} value={valor}>{status.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Status operacional</span>
          <select
            value={statusOperacional}
            onChange={(event) => alterarFiltro(setStatusOperacional, event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_OPERACIONAL).map(([valor, status]) => (
              <option key={valor} value={valor}>{status.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Caminho da contribuição</span>
          <select
            value={caminho}
            onChange={(event) => alterarFiltro(setCaminho, event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
          >
            <option value="">Todos os caminhos</option>
            {Object.entries(CAMINHOS).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83]"
          >
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={limparFiltros}
            className="rounded-lg border border-zinc-700 px-3 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            title="Limpar filtros"
          >
            Limpar
          </button>
        </div>
      </form>

      {erro ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h2 className="font-bold text-white">Não foi possível carregar a Jornada</h2>
            <p className="mt-1 text-sm text-zinc-400">{erro}</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-zinc-800 p-5">
            <UsersRound className="h-5 w-5 text-[#d89900]" />
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{total.toLocaleString('pt-BR')}</strong>{' '}
              contato{total === 1 ? '' : 's'} encontrado{total === 1 ? '' : 's'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full text-left">
              <thead className="bg-zinc-800/70 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Última contribuição</th>
                  <th className="p-4 font-semibold">Vínculo</th>
                  <th className="p-4 font-semibold">Operação</th>
                  <th className="p-4 font-semibold">Tags</th>
                  <th className="p-4 font-semibold">Envios</th>
                  <th className="p-4 font-semibold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#d89900]" />
                    </td>
                  </tr>
                ) : contatos.length ? (
                  contatos.map((contato) => {
                    const ultima = contato.jornadaContribuicoes?.[0];

                    return (
                      <tr key={contato.id} className="transition-colors hover:bg-zinc-800/40">
                        <td className="p-4">
                          <p className="font-medium text-white">{contato.nome || 'Sem nome'}</p>
                          <p className="mt-1 text-sm text-zinc-500">{contato.email}</p>
                          <p className="mt-1 text-xs text-zinc-600">{contato.whatsapp || 'WhatsApp não informado'}</p>
                        </td>
                        <td className="p-4">
                          {ultima ? (
                            <>
                              <p className="text-sm text-zinc-200">{CAMINHOS[ultima.caminho] || ultima.caminho}</p>
                              <p className="mt-1 text-xs text-zinc-500">{formatarData(ultima.createdAt)}</p>
                            </>
                          ) : (
                            <span className="text-sm text-zinc-600">Sem contribuição</span>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge mapa={STATUS_VINCULO} valor={ultima?.statusVinculo} />
                        </td>
                        <td className="p-4">
                          <StatusBadge mapa={STATUS_OPERACIONAL} valor={ultima?.statusOperacional} />
                        </td>
                        <td className="max-w-48 p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(ultima?.tags || []).length ? (
                              ultima.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
                            ) : (
                              <span className="text-xs text-zinc-600">Sem tags</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center text-sm font-bold text-zinc-300">
                          {contato._count?.jornadaContribuicoes || 0}
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/admin/jornada/${contato.id}`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 transition-colors hover:border-[#d89900] hover:text-[#d89900]"
                          >
                            Ver histórico
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-sm text-zinc-500">
                      Nenhum contato encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">Página {pagina} de {totalPages}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((atual) => Math.max(1, atual - 1))}
                disabled={loading || pagina <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((atual) => Math.min(totalPages, atual + 1))}
                disabled={loading || pagina >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}