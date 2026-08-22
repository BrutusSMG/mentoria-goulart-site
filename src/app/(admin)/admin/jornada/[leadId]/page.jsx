// src/app/(admin)/admin/jornada/[leadId]/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  Save,
  Tag,
  UserRound,
} from 'lucide-react';
import { TAGS_JORNADA } from '@/lib/jornada-triagem';

const STATUS_VINCULO = {
  AUTODECLARADO: { label: 'Autodeclarado', className: 'bg-blue-500/15 text-blue-300' },
  PENDENTE_VERIFICACAO: { label: 'Pendente de verificação', className: 'bg-amber-500/15 text-amber-300' },
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

function obterResposta(respostas, chave) {
  if (!respostas || typeof respostas !== 'object') return '';
  const valor = respostas[chave];
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'string') return valor;
  return JSON.stringify(valor, null, 2);
}

function EditorContribuicao({ contribuicao, onSalvo }) {
  const [statusVinculo, setStatusVinculo] = useState(contribuicao.statusVinculo || 'PENDENTE_VERIFICACAO');
  const [statusOperacional, setStatusOperacional] = useState(contribuicao.statusOperacional || 'NOVA_RESPOSTA');
  const [tags, setTags] = useState(contribuicao.tags || []);
  const [observacoesInternas, setObservacoesInternas] = useState(contribuicao.observacoesInternas || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const respostas = contribuicao.respostas || {};

  function alternarTag(tag) {
    setTags((atuais) => (
      atuais.includes(tag)
        ? atuais.filter((item) => item !== tag)
        : [...atuais, tag]
    ));
  }

  async function salvar() {
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(`/api/admin/jornada/contribuicoes/${contribuicao.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusVinculo,
          statusOperacional,
          tags,
          observacoesInternas,
        }),
      });
      const payload = await resposta.json();

      if (!resposta.ok) {
        throw new Error(payload.error || 'Não foi possível salvar a triagem.');
      }

      setSucesso('Triagem salva com sucesso.');
      onSalvo?.(payload);
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a triagem.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[#d89900]/15 text-[#f4c553]">
              {CAMINHOS[contribuicao.caminho] || contribuicao.caminho || 'Outro'}
            </Badge>
            <span className="text-xs text-zinc-600">Versão {contribuicao.formVersion || '1.0'}</span>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <Clock3 className="h-4 w-4 text-[#d89900]" />
            Enviada em {formatarData(contribuicao.createdAt)}
          </p>
        </div>
        <p className="text-xs text-zinc-600">ID: {contribuicao.id}</p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-zinc-300">
              <MessageSquareText className="h-4 w-4 text-[#d89900]" />
              Respostas da contribuição
            </h3>
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Resumo</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                  {obterResposta(respostas, 'resumo') || 'Não informado.'}
                </p>
              </div>

              {Object.entries(respostas)
                .filter(([chave]) => chave !== 'resumo')
                .map(([chave, valor]) => (
                  <div key={chave} className="rounded-xl border border-zinc-800 bg-black/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">{chave}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                      {typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-300">Produtos declarados</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(contribuicao.produtosDeclarados || []).length ? (
                contribuicao.produtosDeclarados.map((produto) => (
                  <Badge key={produto}>{produto}</Badge>
                ))
              ) : (
                <span className="text-sm text-zinc-600">Nenhum produto informado.</span>
              )}
            </div>
          </section>
        </div>

        <aside className="rounded-xl border border-zinc-800 bg-black/30 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Tag className="h-4 w-4 text-[#d89900]" />
            Triagem interna
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Vínculo</span>
              <select
                value={statusVinculo}
                onChange={(event) => setStatusVinculo(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
              >
                {Object.entries(STATUS_VINCULO).map(([valor, status]) => (
                  <option key={valor} value={valor}>{status.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Status operacional</span>
              <select
                value={statusOperacional}
                onChange={(event) => setStatusOperacional(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#d89900]"
              >
                {Object.entries(STATUS_OPERACIONAL).map(([valor, status]) => (
                  <option key={valor} value={valor}>{status.label}</option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </legend>
              <div className="space-y-2">
                {TAGS_JORNADA.map((tag) => (
                  <label key={tag} className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 p-2.5 text-sm text-zinc-300 hover:border-zinc-600">
                    <input
                      type="checkbox"
                      checked={tags.includes(tag)}
                      onChange={() => alternarTag(tag)}
                      className="h-4 w-4 accent-[#d89900]"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Observações internas</span>
              <textarea
                value={observacoesInternas}
                onChange={(event) => setObservacoesInternas(event.target.value)}
                maxLength={5000}
                rows={5}
                className="w-full resize-y rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#d89900]"
                placeholder="Registre a conferência, o próximo contato ou uma decisão interna."
              />
            </label>

            {erro ? (
              <div className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            ) : null}

            {sucesso ? (
              <div className="flex gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{sucesso}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={salvar}
              disabled={salvando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d89900] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {salvando ? 'Salvando...' : 'Salvar triagem'}
            </button>

            {contribuicao.verificadoPor ? (
              <p className="text-xs leading-relaxed text-zinc-600">
                Vínculo confirmado por {contribuicao.verificadoPor} em {formatarData(contribuicao.verificadoEm)}.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  );
}

export default function JornadaDetalhePage() {
  const params = useParams();
  const leadId = params?.leadId;
  const [contato, setContato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarContato() {
    if (!leadId) return;

    setLoading(true);
    setErro('');

    try {
      const resposta = await fetch(`/api/admin/jornada/contatos/${leadId}`, {
        cache: 'no-store',
      });
      const payload = await resposta.json();

      if (!resposta.ok) {
        throw new Error(payload.error || 'Não foi possível carregar o histórico.');
      }

      setContato(payload);
    } catch (error) {
      setErro(error.message || 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregarContato();
    // A página precisa reagir somente à troca do parâmetro dinâmico.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const contribuicoes = useMemo(
    () => contato?.jornadaContribuicoes || [],
    [contato],
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/admin/jornada"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition-colors hover:text-[#d89900]"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a Jornada
          </Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#d89900]">Histórico do contato</p>
          <h1 className="mt-2 text-3xl font-black text-white">
            {contato?.nome || 'Carregando contato...'}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-16 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#d89900]" />
          <p className="mt-4 text-sm text-zinc-500">Carregando histórico...</p>
        </div>
      ) : erro ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h2 className="font-bold text-white">Não foi possível carregar o contato</h2>
            <p className="mt-1 text-sm text-zinc-400">{erro}</p>
          </div>
        </div>
      ) : contato ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <UserRound className="h-5 w-5 text-[#d89900]" />
              <p className="mt-4 text-xs uppercase tracking-wide text-zinc-600">Contato</p>
              <p className="mt-1 font-medium text-white">{contato.nome || 'Sem nome'}</p>
              <p className="mt-1 text-sm text-zinc-500">{contato.email}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">WhatsApp</p>
              <p className="mt-3 font-medium text-zinc-200">{contato.whatsapp || 'Não informado'}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">Primeiro cadastro</p>
              <p className="mt-3 font-medium text-zinc-200">{formatarData(contato.createdAt)}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-600">Contribuições</p>
              <p className="mt-3 font-medium text-zinc-200">{contribuicoes.length}</p>
            </div>
          </section>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Timeline da Jornada</h2>
                <p className="mt-1 text-sm text-zinc-500">Cada envio permanece preservado como uma contribuição independente.</p>
              </div>
            </div>

            {contribuicoes.length ? (
              contribuicoes.map((contribuicao) => (
                <EditorContribuicao
                  key={contribuicao.id}
                  contribuicao={contribuicao}
                  onSalvo={carregarContato}
                />
              ))
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-sm text-zinc-500">
                Este contato ainda não possui contribuições.
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
