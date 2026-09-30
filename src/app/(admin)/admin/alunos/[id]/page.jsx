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

const INFORMACOES_CONVITE_LEGADO = {
  PENDENTE: {
    rotulo: "Pendente",
    descricao:
      "Não há envio confirmado no cadastro. Verifique os dados antes de iniciar qualquer tentativa.",
  },
  EM_ANDAMENTO: {
    rotulo: "Em andamento",
    descricao:
      "Uma tentativa de envio foi iniciada. Não inicie outra tentativa enquanto o resultado não for confirmado.",
  },
  ENVIADO: {
    rotulo: "Envio aceito pelo provedor",
    descricao:
      "O provedor aceitou o envio do convite. Isso não confirma a entrega na caixa de entrada do aluno.",
  },
  FALHA: {
    rotulo: "Falha no envio",
    descricao:
      "A tentativa foi registrada como falha. É necessária conferência antes de qualquer nova ação.",
  },
  INDETERMINADO: {
    rotulo: "Resultado indeterminado",
    descricao:
      "Não foi possível confirmar o resultado do envio. Confira o registro no provedor antes de considerar um reenvio.",
  },
  CONFERIR: {
    rotulo: "Conferência necessária",
    descricao:
      "Os dados do convite ou do primeiro acesso estão incompletos ou inconsistentes. Confira os registros antes de agir.",
  },
  PRIMEIRO_ACESSO_CONCLUIDO: {
    rotulo: "Primeiro acesso concluído",
    descricao:
      "A conta possui senha configurada e registro de verificação do e-mail.",
  },
};

function classeSituacaoVigencia(status) {
  if (status === "ATIVA") {
    return "bg-green-500/15 text-green-400";
  }

  if (status === "AGENDADA" || status === "PENDENTE") {
    return "bg-amber-500/15 text-amber-300";
  }

  if (status === "SUSPENSA") {
    return "bg-orange-500/15 text-orange-300";
  }

  if (
    status === "EXPIRADA" ||
    status === "CANCELADA" ||
    status === "ENCERRADA"
  ) {
    return "bg-red-500/15 text-red-300";
  }

  return "bg-zinc-700/50 text-zinc-300";
}

function formatarDuracao(tipoDuracao) {
  if (tipoDuracao === "DEFINIDA") return "Definida";
  if (tipoDuracao === "INDEFINIDA") return "Sem vencimento definido";
  if (tipoDuracao === "VITALICIA") return "Vitalícia";
  return tipoDuracao || "Não informado";
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

  const informacoesConvite =
    aluno.origem === "LEGADO"
      ? INFORMACOES_CONVITE_LEGADO[
          aluno.estadoConviteLegado
        ] ?? {
          rotulo: "Estado indisponível",
          descricao:
            "Não foi possível identificar o estado do convite. Confira os registros antes de agir.",
        }
      : null;

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

            {informacoesConvite && (
        <Secao titulo="Convite de primeiro acesso" icone={Mail}>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Estado do convite legado
            </p>

            <p className="text-base font-bold text-white">
              {informacoesConvite.rotulo}
            </p>

            <p className="text-sm leading-relaxed text-zinc-400">
              {informacoesConvite.descricao}
            </p>

            {aluno.conviteLegadoEnviadoEm && (
              <p className="text-xs text-zinc-500">
                Data de envio registrada no cadastro:{" "}
                {formatarData(aluno.conviteLegadoEnviadoEm)}
              </p>
            )}

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Auditoria da tentativa
              </p>

              {aluno.controleConviteLegado ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Campo
                    rotulo="Estado registrado no controle"
                    valor={aluno.controleConviteLegado.status}
                  />

                  <Campo
                    rotulo="Tentativas registradas"
                    valor={
                      aluno.controleConviteLegado.tentativas == null
                        ? "Não informado"
                        : String(aluno.controleConviteLegado.tentativas)
                    }
                  />

                  <Campo
                    rotulo="Tentativa iniciada em"
                    valor={formatarData(
                      aluno.controleConviteLegado.tentativaIniciadaEm
                    )}
                  />

                  <Campo
                    rotulo="Tentativa encerrada em"
                    valor={formatarData(
                      aluno.controleConviteLegado.tentativaEncerradaEm
                    )}
                  />
                </dl>
              ) : (
                <p className="text-sm leading-relaxed text-orange-300">
                  Nenhum controle de convite encontrado para este aluno.
                  É necessária conferência dos registros.
                </p>
              )}
            </div>

            <p className="border-t border-zinc-800 pt-3 text-xs text-zinc-500">
              Esta seção é somente para consulta. Nenhum convite
              pode ser enviado ou reenviado por aqui.
            </p>
          </div>
        </Secao>
      )}

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

      <Secao titulo="Histórico de vigências" icone={CalendarDays}>
        {aluno.matriculas?.some(
          (matricula) => matricula.vigencias?.length,
        ) ? (
          <div className="space-y-6">
            {aluno.matriculas.map((matricula) => {
              if (!matricula.vigencias?.length) {
                return null;
              }

              return (
                <div
                  key={matricula.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Produto
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {matricula.produtoNome}
                      </p>
                    </div>

                    <div className="text-sm text-zinc-400">
                      Matrícula:{" "}
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${classeSituacaoVigencia(
                          matricula.status,
                        )}`}
                      >
                        {matricula.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {matricula.vigencias.map((vigencia) => (
                      <div
                        key={vigencia.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              Vigência
                            </p>

                            <p className="mt-1 font-mono text-xs text-zinc-400">
                              {vigencia.id}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${classeSituacaoVigencia(
                                vigencia.status,
                              )}`}
                            >
                              Banco: {vigencia.status}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs ${classeSituacaoVigencia(
                                vigencia.situacaoTemporal,
                              )}`}
                            >
                              Temporal: {vigencia.situacaoTemporal}
                            </span>
                          </div>
                        </div>

                        <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                          <Campo
                            rotulo="Origem"
                            valor={vigencia.origem}
                          />

                          <Campo
                            rotulo="Duração"
                            valor={formatarDuracao(
                              vigencia.tipoDuracao,
                            )}
                          />

                          <Campo
                            rotulo="Concedida em"
                            valor={formatarData(
                              vigencia.concedidaEm,
                            )}
                          />

                          <Campo
                            rotulo="Início"
                            valor={formatarData(
                              vigencia.iniciaEm,
                            )}
                          />

                          <Campo
                            rotulo="Garantia até"
                            valor={formatarData(
                              vigencia.garantiaAte,
                            )}
                          />

                          <Campo
                            rotulo="Término"
                            valor={
                              vigencia.tipoDuracao === "VITALICIA"
                                ? "Vitalício"
                                : vigencia.expiraEm
                                  ? formatarData(vigencia.expiraEm)
                                  : "Sem vencimento definido"
                            }
                          />

                          <Campo
                            rotulo="Aviso de expiração"
                            valor={
                              vigencia.avisoExpiracaoEnviadoEm
                                ? formatarData(
                                    vigencia.avisoExpiracaoEnviadoEm,
                                  )
                                : "Não enviado"
                            }
                          />

                          <Campo
                            rotulo="Status alterado em"
                            valor={formatarData(
                              vigencia.statusAlteradoEm,
                            )}
                          />

                          {vigencia.canceladaEm && (
                            <Campo
                              rotulo="Cancelada em"
                              valor={formatarData(
                                vigencia.canceladaEm,
                              )}
                            />
                          )}

                          {vigencia.encerradaEm && (
                            <Campo
                              rotulo="Encerrada em"
                              valor={formatarData(
                                vigencia.encerradaEm,
                              )}
                            />
                          )}

                          {vigencia.transacaoOrigemId && (
                            <Campo
                              rotulo="Transação de origem"
                              valor={vigencia.transacaoOrigemId}
                            />
                          )}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Nenhuma vigência encontrada para este aluno.
          </p>
        )}
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