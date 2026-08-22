// src/app/jornada-do-aluno/page.jsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUtms } from '@/utils/utm';
import { trackEvent } from '@/utils/tracking';
import { PRODUTOS_JORNADA } from '@/lib/jornada-produtos';
import {
  BookOpenText,
  CircleHelp,
  Gem,
  GraduationCap,
  PackageOpen,
} from 'lucide-react';

const CAMINHOS = [
  { value: 'HISTORIA', label: 'Minha história na Mentoria' },
  { value: 'CASE', label: 'Um resultado ou conquista' },
  { value: 'MELHORIA', label: 'Uma sugestão para melhorar a Mentoria' },
  { value: 'NOVO_CONTEUDO', label: 'Uma ideia para novos conteúdos ou aulas' },
  { value: 'PARCERIA', label: 'Uma oportunidade de parceria ou colaboração' },
  { value: 'OUTRO', label: 'Outro assunto' },
];

const ICONE_PRODUTO = {
  'curso-garimpo-urbano-com-mentoria': GraduationCap,
  'curso-garimpo-urbano-sem-mentoria': GraduationCap,
  'curso-eletrodeposicao-joias-semi-joias': Gem,
  'guia-definitivo-garimpo-urbano': BookOpenText,
  'recuperacao-metais-residuos-oficinas': Gem,
  'tesouros-escondidos-ouro-prata': BookOpenText,
  'eletrodeposicao-galvanoplastia-joias': BookOpenText,
  outro: PackageOpen,
  'nao-tenho-certeza': CircleHelp,
  'nenhum-produto': CircleHelp,
};

function novaChave() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const estadoInicial = {
  nome: '',
  email: '',
  whatsapp: '',
  cidadeEstado: '',
  tempoMentoria: '',
  dataCompraAproximada: '',
  produtosDeclarados: [],
  caminho: '',
  respostas: {},
  interesseEntrevista: '',
  consentimentoEntrevista: false,
  consentimentoConteudo: false,
  melhorCanal: '',
  contatoPreferencial: '',
  telefone_secundario: '',
};

export default function JornadaDoAlunoPage() {
  const router = useRouter();
  const [dados, setDados] = useState(estadoInicial);
  const [etapa, setEtapa] = useState(0);
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');
  const [idempotencyKey] = useState(novaChave);

  const totalEtapas = 4;
  const progresso = useMemo(
    () => ((etapa + 1) / totalEtapas) * 100,
    [etapa],
  );

  function atualizar(campo, valor) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function alternarProduto(slug) {
    setDados((anterior) => {
      const selecionados = anterior.produtosDeclarados.includes(slug)
        ? anterior.produtosDeclarados.filter((item) => item !== slug)
        : [...anterior.produtosDeclarados, slug];

      return { ...anterior, produtosDeclarados: selecionados };
    });
  }

  function atualizarResposta(campo, valor) {
    setDados((anterior) => ({
      ...anterior,
      respostas: { ...anterior.respostas, [campo]: valor },
    }));
  }

  function podeAvancar() {
    if (etapa === 0) {
      return Boolean(
        dados.nome.trim() &&
          dados.email.trim() &&
          dados.whatsapp.trim() &&
          dados.tempoMentoria &&
          dados.produtosDeclarados.length,
      );
    }

    if (etapa === 1) {
      return Boolean(dados.caminho);
    }

    if (etapa === 2) {
      return Boolean(dados.respostas.resumo?.trim());
    }

    return Boolean(dados.interesseEntrevista && dados.melhorCanal);
  }

  function avancar() {
    if (!podeAvancar()) {
      setErro('Preencha os campos obrigatórios para continuar.');
      return;
    }

    setErro('');
    setEtapa((valor) => Math.min(valor + 1, totalEtapas - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function enviar(e) {
    e.preventDefault();

    if (!podeAvancar()) {
      setErro('Preencha os campos obrigatórios antes de enviar.');
      return;
    }

    setStatus('loading');
    setErro('');

    try {
      const response = await fetch('/api/jornada/contribuicoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dados,
          idempotencyKey,
          formVersion: '1.0',
          utms: getUtms(),
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Falha ao enviar.');
      }

      trackEvent('CompleteRegistration', {
        content_name: 'jornada_do_aluno',
        content_category: dados.caminho,
      });

      router.push('/jornada-do-aluno/sucesso');
    } catch (error) {
      setStatus('error');
      setErro(error.message || 'Não foi possível enviar sua contribuição.');
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:py-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#d89900]">
            Sua Jornada no Garimpo Urbano
          </p>
          <h1 className="text-3xl font-black md:text-5xl">
            Queremos ouvir você.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
            Conte sua história, compartilhe seus resultados, indique melhorias
            ou sugira os próximos conteúdos da Mentoria.
          </p>
        </header>

        <div
          className="mb-8 h-2 overflow-hidden rounded-full bg-zinc-800"
          aria-label={`Progresso: etapa ${etapa + 1} de ${totalEtapas}`}
        >
          <div
            className="h-full bg-[#d89900] transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <form
          onSubmit={enviar}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl md:p-8"
        >
          {etapa === 0 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-bold">Vamos começar</h2>
              <p className="text-sm text-zinc-400">
                Queremos conhecer você e entender sua relação com o Garimpo Urbano.
              </p>

              <label className="block" htmlFor="nome">
                <span className="mb-2 block text-sm text-zinc-300">
                  Nome completo *
                </span>
                <input
                  id="nome"
                  name="nome"
                  required
                  autoComplete="name"
                  value={dados.nome}
                  onChange={(e) => atualizar('nome', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 bg-black text-white placeholder:text-zinc-500"
                />
              </label>

              <label className="block" htmlFor="email">
                <span className="mb-2 block text-sm text-zinc-300">
                  E-mail *
                </span>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  autoComplete="email"
                  value={dados.email}
                  onChange={(e) => atualizar('email', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 bg-black text-white placeholder:text-zinc-500"
                />
              </label>

              <label className="block" htmlFor="whatsapp">
                <span className="mb-2 block text-sm text-zinc-300">
                  WhatsApp *
                </span>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  required
                  type="tel"
                  autoComplete="tel"
                  value={dados.whatsapp}
                  onChange={(e) => atualizar('whatsapp', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                />
              </label>

              <label className="block" htmlFor="cidadeEstado">
                <span className="mb-2 block text-sm text-zinc-300">
                  Cidade/Estado
                </span>
                <input
                  id="cidadeEstado"
                  name="cidadeEstado"
                  autoComplete="address-level2"
                  value={dados.cidadeEstado}
                  onChange={(e) => atualizar('cidadeEstado', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                />
              </label>

              <label className="block" htmlFor="tempoMentoria">
                <span className="mb-2 block text-sm text-zinc-300">
                  Há quanto tempo você está na Mentoria Garimpo Urbano? *
                </span>
                <select
                  id="tempoMentoria"
                  name="tempoMentoria"
                  required
                  value={dados.tempoMentoria}
                  onChange={(e) => atualizar('tempoMentoria', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="MENOS_1_MES">Há menos de 1 mês</option>
                  <option value="1_3_MESES">De 1 a 3 meses</option>
                  <option value="4_6_MESES">De 4 a 6 meses</option>
                  <option value="7_12_MESES">De 7 a 12 meses</option>
                  <option value="MAIS_1_ANO">Há mais de 1 ano</option>
                  <option value="NAO_SEI">Não tenho certeza</option>
                </select>
              </label>

              <fieldset>
                <legend className="mb-2 text-sm text-zinc-300">
                  Quais produtos do Garimpo Urbano você conhece ou já adquiriu? *
                </legend>
                <p className="mb-4 text-sm text-zinc-500">
                  Pode selecionar mais de uma opção.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {PRODUTOS_JORNADA.map((produto) => {
                    const Icone = ICONE_PRODUTO[produto.slug] || PackageOpen;
                    const selecionado = dados.produtosDeclarados.includes(
                      produto.slug,
                    );

                    return (
                      <label
                        key={produto.slug}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          selecionado
                            ? 'border-[#d89900] bg-[#d89900]/10'
                            : 'border-zinc-800 bg-black hover:border-zinc-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => alternarProduto(produto.slug)}
                          className="sr-only"
                        />

                        <span
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                            selecionado
                              ? 'bg-[#d89900] text-black'
                              : 'bg-zinc-900 text-[#d89900]'
                          }`}
                        >
                          <Icone className="h-5 w-5" aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                          <span className="block font-semibold text-white">
                            {produto.nome}
                          </span>
                          <span className="mt-1 block text-xs text-zinc-500">
                            {produto.tipo}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </section>
          )}

          {etapa === 1 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-bold">
                Sua experiência no Garimpo Urbano
              </h2>
              <p className="text-sm text-zinc-400">
                Queremos entender o que você viveu, conquistou, aprendeu ou gostaria de ver na Mentoria.
              </p>

              <label className="block" htmlFor="caminho">
                <span className="mb-2 block text-sm text-zinc-300">
                  O que você gostaria de compartilhar conosco hoje? *
                </span>
                <select
                  id="caminho"
                  name="caminho"
                  required
                  value={dados.caminho}
                  onChange={(e) => atualizar('caminho', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                >
                  <option value="">Selecione uma opção</option>
                  {CAMINHOS.map((caminho) => (
                    <option key={caminho.value} value={caminho.value}>
                      {caminho.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          )}

          {etapa === 2 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-bold">Conte sua experiência</h2>
              <p className="text-sm text-zinc-400">
                Não existe resposta certa. Queremos conhecer sua experiência real.
              </p>

              <label className="block" htmlFor="resumo">
                <span className="mb-2 block text-sm text-zinc-300">
                  Qual é o principal ponto que você gostaria de compartilhar? *
                </span>
                <textarea
                  id="resumo"
                  name="resumo"
                  required
                  rows={8}
                  value={dados.respostas.resumo || ''}
                  onChange={(e) => atualizarResposta('resumo', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                />
              </label>

              <label className="block" htmlFor="detalhes">
                <span className="mb-2 block text-sm text-zinc-300">
                  Existe algum detalhe adicional? Opcional
                </span>
                <textarea
                  id="detalhes"
                  name="detalhes"
                  rows={5}
                  value={dados.respostas.detalhes || ''}
                  onChange={(e) => atualizarResposta('detalhes', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                />
              </label>
            </section>
          )}

          {etapa === 3 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-bold">Podemos conversar com você?</h2>

              <label className="block" htmlFor="interesseEntrevista">
                <span className="mb-2 block text-sm text-zinc-300">
                  Você gostaria de participar de uma conversa online? *
                </span>
                <select
                  id="interesseEntrevista"
                  name="interesseEntrevista"
                  required
                  value={dados.interesseEntrevista}
                  onChange={(e) => atualizar('interesseEntrevista', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="SIM">Sim, adoraria participar</option>
                  <option value="TALVEZ">Talvez, gostaria de saber mais</option>
                  <option value="NAO">No momento, prefiro não participar</option>
                </select>
              </label>

              <label className="block" htmlFor="melhorCanal">
                <span className="mb-2 block text-sm text-zinc-300">
                  Melhor canal de contato *
                </span>
                <select
                  id="melhorCanal"
                  name="melhorCanal"
                  required
                  value={dados.melhorCanal}
                  onChange={(e) => atualizar('melhorCanal', e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="EMAIL">E-mail</option>
                </select>
              </label>

              <label className="flex gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={dados.consentimentoConteudo}
                  onChange={(e) => atualizar('consentimentoConteudo', e.target.checked)}
                />
                <span>
                  Se eu participar de uma entrevista, autorizo separadamente a
                  utilização da entrevista ou de trechos, conforme combinado.
                </span>
              </label>

              <input
                type="text"
                name="telefone_secundario"
                tabIndex="-1"
                autoComplete="off"
                aria-hidden="true"
                value={dados.telefone_secundario}
                onChange={(e) => atualizar('telefone_secundario', e.target.value)}
                className="hidden"
              />
            </section>
          )}

          {erro && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {erro}
            </p>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              type="button"
              disabled={etapa === 0 || status === 'loading'}
              onClick={() => {
                setErro('');
                setEtapa((valor) => Math.max(0, valor - 1));
              }}
              className="rounded-lg border border-zinc-700 px-5 py-3 disabled:opacity-40"
            >
              Voltar
            </button>

            {etapa < totalEtapas - 1 ? (
              <button
                type="button"
                onClick={avancar}
                className="rounded-lg bg-[#d89900] px-5 py-3 font-bold text-black hover:bg-[#e7a900] focus:outline-none focus:ring-2 focus:ring-[#d89900] focus:ring-offset-2 focus:ring-offset-black"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-lg bg-[#d89900] px-5 py-3 font-bold text-black hover:bg-[#e7a900] focus:outline-none focus:ring-2 focus:ring-[#d89900] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar contribuição'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
