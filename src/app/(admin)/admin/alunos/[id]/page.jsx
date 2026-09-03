// src/app/(admin)/admin/alunos/[id]/page.jsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

function formatarData(data) {
  if (!data) return "Não informado";
  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(valor);
}

function formatarMoeda(valor, moeda = "BRL") {
  if (valor === null || valor === undefined) return "Não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda || "BRL",
  }).format(Number(valor));
}

function classeStatus(status) {
  if (status === "ATIVO" || status === "APPROVED" || status === "COMPLETED") {
    return "bg-green-500/15 text-green-400";
  }
  if (status === "SUSPENSO" || status === "PENDING") {
    return "bg-orange-500/15 text-orange-300";
  }
  if (status === "INATIVO" || status === "REFUNDED" || status === "CHARGEBACK") {
    return "bg-red-500/15 text-red-300";
  }
  return "bg-zinc-700/50 text-zinc-300";
}

function Campo({ rotulo, valor, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{rotulo}</dt>
      <dd className="mt-1 text-sm text-zinc-200">{children ?? (valor || "Não informado")}</dd>
    </div>
  );
}

function Secao({ titulo, icone: Icone, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <Icone className="h-5 w-5 text-[#d89900]" />
        <h2 className="text-lg font-bold text-white">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AlunoDetalhePage() {
  const params = useParams();
  const id = params?.id;
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return;
    let ativo = true;

    async function carregarDetalhes() {
      setLoading(true);
      setErro("");
      try {
        const resposta = await fetch(`/api/admin/alunos/${id}`, { cache: "no-store" });
        const payload = await resposta.json();
        if (!resposta.ok) {
          throw new Error(payload.error || "Não foi possível carregar o aluno.");
        }
        if (ativo) setAluno(payload.item);
      } catch (error) {
        if (ativo) setErro(error.message || "Não foi possível carregar o aluno.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregarDetalhes();
    return () => {
      ativo = false;
    };
  }, [id]);

  if (loading) {
    return <Loader2 className="mx-auto mt-20 h-7 w-7 animate-spin text-[#d89900]" />;
  }

  if (erro) {
    return (
      <div className="space-y-6">
        <Link href="/admin/alunos" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar para alunos
        </Link>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-200">
          {erro}
        </div>
      </div>
    );
  }

  if (!aluno) return null;

  const perfil = aluno.perfil;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/alunos" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar para alunos
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#d89900]">Gestão de alunos</p>
          <h1 className="mt-2 text-3xl font-black text-white">{aluno.nome || "Aluno sem nome"}</h1>
          <p className="mt-2 text-sm text-zinc-500">Cadastro criado em {formatarData(aluno.createdAt)}</p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-medium ${classeStatus(aluno.status)}`}>
          {aluno.status}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Secao titulo="Identificação e contato" icone={UserRound}>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Campo rotulo="Nome" valor={aluno.nome} />
            <Campo rotulo="E-mail" icone={Mail}>
              <a href={`mailto:${aluno.email}`} className="hover:text-[#d89900]">{aluno.email}</a>
            </Campo>
            <Campo rotulo="WhatsApp" icone={Phone} valor={aluno.whatsapp} />
            <Campo rotulo="Origem" valor={aluno.origem} />
            <Campo rotulo="Último login" valor={formatarData(aluno.ultimoLoginEm)} />
            <Campo rotulo="E-mail verificado em" valor={formatarData(aluno.emailVerificadoEm)} />
          </dl>
        </Secao>

        <Secao titulo="Perfil e comunidade" icone={ShieldCheck}>
          {perfil ? (
            <dl className="grid gap-5 sm:grid-cols-2">
              <Campo rotulo="Visibilidade" valor={perfil.visibilidade} />
              <Campo rotulo="Nome de exibição" valor={perfil.nomeExibicao} />
              <Campo rotulo="Cidade" valor={[perfil.cidade, perfil.estado].filter(Boolean).join(" / ")} />
              <Campo rotulo="Mostrar foto" valor={perfil.mostrarFoto ? "Sim" : "Não"} />
              <Campo rotulo="Mostrar localização" valor={perfil.mostrarLocalizacao ? "Sim" : "Não"} />
              <Campo rotulo="Perfil atualizado em" valor={formatarData(perfil.updatedAt)} />
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Biografia</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{perfil.bio || "Não informado"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">O aluno ainda não preencheu o perfil.</p>
          )}
        </Secao>
      </div>

      <Secao titulo="Matrículas" icone={CalendarDays}>
        {aluno.matriculas?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4">Produto</th>
                  <th className="pb-3 pr-4">Origem</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Concedida em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {aluno.matriculas.map((matricula) => (
                  <tr key={matricula.id}>
                    <td className="py-4 pr-4 text-white">{matricula.produtoNome}</td>
                    <td className="py-4 pr-4 text-zinc-400">{matricula.origem}</td>
                    <td className="py-4 pr-4"><span className={`rounded-full px-2.5 py-1 text-xs ${classeStatus(matricula.status)}`}>{matricula.status}</span></td>
                    <td className="py-4 text-zinc-400">{formatarData(matricula.concedidaEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-zinc-500">Nenhuma matrícula encontrada.</p>}
      </Secao>

      <Secao titulo="Transações Hotmart" icone={CreditCard}>
        {aluno.transacoesHotmart?.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4">Produto</th>
                  <th className="pb-3 pr-4">Código</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Valor</th>
                  <th className="pb-3">Aprovada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {aluno.transacoesHotmart.map((transacao) => (
                  <tr key={transacao.id}>
                    <td className="py-4 pr-4 text-white">{transacao.produtoNome}</td>
                    <td className="py-4 pr-4 font-mono text-xs text-zinc-500">{transacao.transacaoCodigo}</td>
                    <td className="py-4 pr-4"><span className={`rounded-full px-2.5 py-1 text-xs ${classeStatus(transacao.status)}`}>{transacao.status}</span></td>
                    <td className="py-4 pr-4 text-zinc-300">{formatarMoeda(transacao.valorBruto, transacao.moeda)}</td>
                    <td className="py-4 text-zinc-400">{formatarData(transacao.aprovadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-zinc-500">Nenhuma transação Hotmart vinculada.</p>}
      </Secao>

      <div className="flex justify-end">
        <Link href="https://consumer.hotmart.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-[#d89900] hover:text-white">
          Aulas na Hotmart <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
   );
}