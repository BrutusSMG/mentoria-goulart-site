"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Pencil,
  X,
} from "lucide-react";

import { formatarPrecoProduto } from "@/lib/preco-produto";

export default function ProdutosAdminPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [precoEditado, setPrecoEditado] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resposta = await fetch("/api/admin/produtos", {
          cache: "no-store",
        });

        const body = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            body.error || "Não foi possível carregar os produtos.",
          );
        }

        if (ativo) {
          setProdutos(body);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  function iniciarEdicao(produto) {
    setErro("");
    setEditandoId(produto.id);
    setPrecoEditado(produto.preco ?? "");
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setPrecoEditado("");
  }

  async function salvarPreco(produtoId) {
    setErro("");
    setSalvando(true);

    try {
      const resposta = await fetch(
        `/api/admin/produtos/${produtoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            preco: precoEditado,
          }),
        },
      );

      const body = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          body.error || "Não foi possível atualizar o preço.",
        );
      }

      setProdutos((atuais) =>
        atuais.map((produto) =>
          produto.id === produtoId ? body : produto,
        ),
      );

      cancelarEdicao();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d89900]">
          Catálogo comercial
        </p>

        <h1 className="mt-2 text-3xl font-black text-white">
          Produtos
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          Gerencie o preço corrente exibido pelo MGU. Identidade,
          integrações, direitos e valores históricos de venda
          não são alterados nesta tela.
        </p>
      </div>

      {erro ? (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {erro}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#d89900]" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-zinc-800">
              <tr>
                <th className="p-4 text-sm font-semibold text-zinc-400">
                  Produto
                </th>
                <th className="p-4 text-sm font-semibold text-zinc-400">
                  Tipo
                </th>
                <th className="p-4 text-sm font-semibold text-zinc-400">
                  Status
                </th>
                <th className="p-4 text-sm font-semibold text-zinc-400">
                  Preço atual
                </th>
                <th className="p-4 text-sm font-semibold text-zinc-400">
                  Promocional
                </th>
                <th className="p-4 text-center text-sm font-semibold text-zinc-400">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((produto, index) => {
                const editando = editandoId === produto.id;

                return (
                  <tr
                    key={produto.id}
                    className={`${
                      index < produtos.length - 1
                        ? "border-b border-zinc-800"
                        : ""
                    } hover:bg-zinc-800/40`}
                  >
                    <td className="p-4">
                      <p className="font-semibold text-white">
                        {produto.nome}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {produto.id}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        /{produto.slug}
                      </p>
                    </td>

                    <td className="p-4 text-sm text-zinc-300">
                      {produto.tipo}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          produto.ativo
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {produto.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>

                    <td className="p-4">
                      {editando ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500">
                            {produto.moeda}
                          </span>

                          <input
                            type="number"
                            min="0"
                            max="9999999999.99"
                            step="0.01"
                            value={precoEditado}
                            onChange={(event) =>
                              setPrecoEditado(event.target.value)
                            }
                            className="w-40 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-white outline-none focus:border-[#d89900]"
                          />
                        </div>
                      ) : (
                        <span className="font-bold text-green-400">
                          {formatarPrecoProduto(
                            produto.preco,
                            produto.moeda,
                          ) || "Preço não informado"}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-sm text-zinc-400">
                      {produto.precoPromocional
                        ? formatarPrecoProduto(
                            produto.precoPromocional,
                            produto.moeda,
                          )
                        : "—"}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {editando ? (
                          <>
                            <button
                              type="button"
                              disabled={salvando}
                              onClick={() => salvarPreco(produto.id)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#d89900] text-black transition-colors hover:bg-[#F7FA83] disabled:opacity-50"
                              title="Salvar preço"
                            >
                              {salvando ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={salvando}
                              onClick={cancelarEdicao}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white disabled:opacity-50"
                              title="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(produto)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-[#d89900]"
                            title="Editar preço"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {produtos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-sm text-zinc-500"
                  >
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
