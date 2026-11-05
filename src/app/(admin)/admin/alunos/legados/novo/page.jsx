// src/app/(admin)/admin/alunos/legados/novo/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";

const TIPOS_DURACAO = [
  {
    valor: "DEFINIDA",
    rotulo: "Data original de término",
  },
  {
    valor: "INDEFINIDA",
    rotulo: "Sem vencimento definido",
  },
  {
    valor: "VITALICIA",
    rotulo: "Vitalícia",
  },
];

function estadoInicial() {
  return {
    nome: "",
    email: "",
    telefone: "",
  };
}

export default function NovoAlunoLegadoPage() {
  const [form, setForm] = useState(estadoInicial);
  const [produtos, setProdutos] = useState([]);
  const [selecionados, setSelecionados] = useState({});
  const [carregandoProdutos, setCarregandoProdutos] =
    useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarProdutos() {
      setCarregandoProdutos(true);
      setErro("");

      try {
        const resposta = await fetch("/api/admin/produtos", {
          cache: "no-store",
        });

        const body = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            body.error ||
              "Não foi possível carregar os produtos.",
          );
        }

        if (ativo) {
          setProdutos(
            body.filter((produto) => produto.ativo),
          );
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error.message ||
              "Não foi possível carregar os produtos.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoProdutos(false);
        }
      }
    }

    void carregarProdutos();

    return () => {
      ativo = false;
    };
  }, []);

  const totalSelecionados = useMemo(
    () => Object.keys(selecionados).length,
    [selecionados],
  );

  function alterarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  function alterarProduto(produtoId, marcado) {
    setResultado(null);
    setErro("");

    setSelecionados((atuais) => {
      if (!marcado) {
        const proximo = { ...atuais };
        delete proximo[produtoId];
        return proximo;
      }

      return {
        ...atuais,
        [produtoId]: {
          tipoDuracao: "",
          dataFimOriginal: "",
        },
      };
    });
  }

  function alterarVigencia(produtoId, campo, valor) {
    setSelecionados((atuais) => ({
      ...atuais,
      [produtoId]: {
        ...atuais[produtoId],
        [campo]: valor,
        ...(campo === "tipoDuracao" &&
        valor !== "DEFINIDA"
          ? { dataFimOriginal: "" }
          : {}),
      },
    }));
  }

  function prepararDados() {
    const produtoIds = produtos
      .filter((produto) => selecionados[produto.id])
      .map((produto) => produto.id);

    if (produtoIds.length === 0) {
      throw new Error(
        "Selecione pelo menos um produto adquirido pelo aluno.",
      );
    }

    const vigencias = produtoIds.map((produtoId) => {
      const configuracao = selecionados[produtoId];

      if (!configuracao?.tipoDuracao) {
        throw new Error(
          "Informe a vigência de todos os produtos selecionados.",
        );
      }

      if (
        configuracao.tipoDuracao === "DEFINIDA" &&
        !configuracao.dataFimOriginal
      ) {
        throw new Error(
          "Informe a data original de término dos produtos com vigência definida.",
        );
      }

      return {
        produtoId,
        tipoDuracao: configuracao.tipoDuracao,
        dataFimOriginal:
          configuracao.tipoDuracao === "DEFINIDA"
            ? configuracao.dataFimOriginal
            : null,
      };
    });

    return {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || null,
      produtoIds,
      vigencias,
    };
  }

  async function cadastrar(event) {
    event.preventDefault();

    setErro("");
    setResultado(null);

    let dados;

    try {
      dados = prepararDados();
    } catch (error) {
      setErro(error.message);
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(
        "/api/admin/alunos/legados",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        },
      );

      const body = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          body.erro ||
            body.error ||
            "Não foi possível cadastrar o aluno legado.",
        );
      }

      setResultado(body.item);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível cadastrar o aluno legado.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function cadastrarOutro() {
    setForm(estadoInicial());
    setSelecionados({});
    setResultado(null);
    setErro("");
  }

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/alunos"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para alunos
        </Link>

        <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#d89900]">
          Gestão de alunos
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Adicionar aluno legado
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          Cadastre alunos anteriores ao fluxo automatizado atual,
          preservando os produtos adquiridos e suas vigências
          históricas.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="font-bold text-amber-200">
          Cadastro e convite são operações independentes
        </p>

        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Esta tela cria o cadastro legado e os acessos
          correspondentes. Nenhum convite de primeiro acesso
          será enviado nesta operação.
        </p>
      </div>

      {erro ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <p className="text-sm leading-relaxed text-red-200">
            {erro}
          </p>
        </div>
      ) : null}

      {resultado ? (
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-400" />

            <div>
              <h2 className="font-bold text-white">
                Aluno legado cadastrado
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                O cadastro foi criado e o convite permanece
                pendente.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/admin/alunos/${resultado.alunoId}`}
                  className="rounded-lg bg-[#d89900] px-4 py-2 text-sm font-bold text-black hover:bg-[#F7FA83]"
                >
                  Ver aluno
                </Link>

                <button
                  type="button"
                  onClick={cadastrarOutro}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white"
                >
                  Cadastrar outro
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={cadastrar}
          className="space-y-6"
        >
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-bold text-white">
              Identificação
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-300">
                  Nome
                </span>

                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.nome}
                  onChange={(event) =>
                    alterarCampo("nome", event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-white outline-none focus:border-[#d89900]"
                  placeholder="Nome do aluno"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-300">
                  E-mail
                </span>

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    alterarCampo("email", event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-white outline-none focus:border-[#d89900]"
                  placeholder="aluno@exemplo.com"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-zinc-300">
                  Telefone / WhatsApp
                </span>

                <input
                  value={form.telefone}
                  onChange={(event) =>
                    alterarCampo(
                      "telefone",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-white outline-none focus:border-[#d89900]"
                  placeholder="Opcional"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Produtos adquiridos
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Selecione apenas produtos que o aluno realmente
                adquiriu no histórico anterior.
              </p>
            </div>

            {carregandoProdutos ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#d89900]" />
              </div>
            ) : produtos.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">
                Nenhum produto ativo disponível.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {produtos.map((produto) => {
                  const configuracao =
                    selecionados[produto.id];

                  return (
                    <div
                      key={produto.id}
                      className="rounded-xl border border-zinc-800 bg-black/40 p-5"
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(configuracao)}
                          onChange={(event) =>
                            alterarProduto(
                              produto.id,
                              event.target.checked,
                            )
                          }
                          className="mt-1 h-4 w-4"
                        />

                        <div>
                          <p className="font-semibold text-white">
                            {produto.nome}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {produto.tipo} · {produto.id}
                          </p>
                        </div>
                      </label>

                      {configuracao ? (
                        <div className="mt-5 grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-2">
                          <label className="block">
                            <span className="text-sm font-medium text-zinc-300">
                              Vigência
                            </span>

                            <select
                              required
                              value={
                                configuracao.tipoDuracao
                              }
                              onChange={(event) =>
                                alterarVigencia(
                                  produto.id,
                                  "tipoDuracao",
                                  event.target.value,
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-white outline-none focus:border-[#d89900]"
                            >
                              <option value="">
                                Selecione
                              </option>

                              {TIPOS_DURACAO.map(
                                (tipo) => (
                                  <option
                                    key={tipo.valor}
                                    value={tipo.valor}
                                  >
                                    {tipo.rotulo}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>

                          {configuracao.tipoDuracao ===
                          "DEFINIDA" ? (
                            <label className="block">
                              <span className="text-sm font-medium text-zinc-300">
                                Data original de término
                              </span>

                              <input
                                required
                                type="date"
                                value={
                                  configuracao.dataFimOriginal
                                }
                                onChange={(event) =>
                                  alterarVigencia(
                                    produto.id,
                                    "dataFimOriginal",
                                    event.target.value,
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2.5 text-white outline-none focus:border-[#d89900]"
                              />

                              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                                Informe a data existente no
                                histórico original. Não
                                informe uma nova duração a
                                partir de hoje.
                              </p>
                            </label>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              {totalSelecionados === 0
                ? "Nenhum produto selecionado."
                : `${totalSelecionados} produto${
                    totalSelecionados === 1 ? "" : "s"
                  } selecionado${
                    totalSelecionados === 1 ? "" : "s"
                  }.`}
            </p>

            <button
              type="submit"
              disabled={
                salvando ||
                carregandoProdutos ||
                totalSelecionados === 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d89900] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#F7FA83] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}

              Cadastrar aluno legado
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
