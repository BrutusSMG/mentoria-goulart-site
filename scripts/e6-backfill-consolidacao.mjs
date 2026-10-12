import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const APLICAR = process.argv.includes("--apply");
const CONFIRMAR = process.argv.includes("--confirmar-e6.6");

const argumentoAmbiente = process.argv.find(
  (arg) => arg.startsWith("--ambiente="),
);

const AMBIENTE = argumentoAmbiente
  ? argumentoAmbiente.split("=")[1]
  : null;

const AMBIENTES_VALIDOS = new Set([
  "homologacao",
  "production",
]);

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarTelefone(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function contarPor(plano, campo = "classificacao") {
  return plano.reduce((acumulado, item) => {
    const chave = item[campo];

    acumulado[chave] =
      (acumulado[chave] || 0) + 1;

    return acumulado;
  }, {});
}

function possuiConflito(plano) {
  return plano.some((item) =>
    item.classificacao.startsWith("CONFLITO_"),
  );
}

function validarArgumentos() {
  if (!APLICAR) {
    return;
  }

  if (!AMBIENTE || !AMBIENTES_VALIDOS.has(AMBIENTE)) {
    throw new Error(
      "Para aplicar, informe --ambiente=homologacao ou --ambiente=production.",
    );
  }

  if (!CONFIRMAR) {
    throw new Error(
      "Para aplicar, informe também --confirmar-e6.6.",
    );
  }

  const ambienteConfigurado =
    String(
      process.env.MGU_DATABASE_ENV || "",
    ).trim();

  if (
    !ambienteConfigurado ||
    !AMBIENTES_VALIDOS.has(ambienteConfigurado)
  ) {
    throw new Error(
      "Para aplicar, defina MGU_DATABASE_ENV=homologacao ou production.",
    );
  }

  if (ambienteConfigurado !== AMBIENTE) {
    throw new Error(
      "MGU_DATABASE_ENV diverge do ambiente declarado.",
    );
  }

  const vercelEnv =
    String(process.env.VERCEL_ENV || "").trim();

  if (
    vercelEnv === "production" &&
    AMBIENTE !== "production"
  ) {
    throw new Error(
      "VERCEL_ENV=production diverge do ambiente declarado.",
    );
  }

  if (
    vercelEnv === "preview" &&
    AMBIENTE !== "homologacao"
  ) {
    throw new Error(
      "VERCEL_ENV=preview diverge do ambiente declarado.",
    );
  }
}

async function carregarPlanoProdutos(tx) {
  const matriculas = await tx.matricula.findMany({
    orderBy: {
      createdAt: "asc",
    },

    select: {
      id: true,
      origem: true,
      produtoId: true,
      produtoCatalogoId: true,

      transacoesHotmart: {
        select: {
          produtoCatalogoId: true,
        },
      },
    },
  });

  const plano = [];

  for (const matricula of matriculas) {
    const produtosTransacao = [
      ...new Set(
        matricula.transacoesHotmart
          .map(
            (transacao) =>
              transacao.produtoCatalogoId,
          )
          .filter(Boolean),
      ),
    ];

    const integracao =
      await tx.produtoIntegracao.findUnique({
        where: {
          provedor_externalId: {
            provedor: "HOTMART",
            externalId: matricula.produtoId,
          },
        },

        select: {
          produtoId: true,
          ativo: true,
        },
      });

    const produtoDireto =
      await tx.produto.findUnique({
        where: {
          id: matricula.produtoId,
        },

        select: {
          id: true,
        },
      });

    let classificacao =
      "PRESERVAR_SEM_ASSOCIACAO";

    let produtoCandidato = null;

    if (produtosTransacao.length > 1) {
      classificacao =
        "CONFLITO_TRANSACOES";

      plano.push({
        matriculaId: matricula.id,
        classificacao,
        produtoCandidato,
      });

      continue;
    }

    const produtoViaTransacao =
      produtosTransacao[0] || null;

    if (
      produtoViaTransacao &&
      integracao?.produtoId &&
      produtoViaTransacao !==
        integracao.produtoId
    ) {
      classificacao =
        "CONFLITO_TRANSACAO_INTEGRACAO";

      plano.push({
        matriculaId: matricula.id,
        classificacao,
        produtoCandidato,
      });

      continue;
    }

    if (matricula.produtoCatalogoId) {
      if (
        produtoViaTransacao &&
        matricula.produtoCatalogoId !==
          produtoViaTransacao
      ) {
        classificacao =
          "CONFLITO_CATALOGO_TRANSACAO";
      } else if (
        matricula.origem === "HOTMART" &&
        integracao?.produtoId &&
        matricula.produtoCatalogoId !==
          integracao.produtoId
      ) {
        classificacao =
          "CONFLITO_CATALOGO_INTEGRACAO";
      } else if (
        matricula.origem === "LEGADO" &&
        produtoDireto?.id &&
        matricula.produtoCatalogoId !==
          produtoDireto.id
      ) {
        classificacao =
          "CONFLITO_CATALOGO_ID_INTERNO";
      } else {
        classificacao =
          "JA_PREENCHIDA";
      }

      plano.push({
        matriculaId: matricula.id,
        classificacao,
        produtoCandidato:
          matricula.produtoCatalogoId,
      });

      continue;
    }

    if (
      matricula.origem === "HOTMART" &&
      produtoViaTransacao
    ) {
      classificacao =
        "PREENCHER_TRANSACAO";

      produtoCandidato =
        produtoViaTransacao;
    } else if (
      matricula.origem === "HOTMART" &&
      integracao?.produtoId &&
      integracao.ativo
    ) {
      classificacao =
        "PREENCHER_INTEGRACAO";

      produtoCandidato =
        integracao.produtoId;
    } else if (
      matricula.origem === "LEGADO" &&
      produtoDireto?.id
    ) {
      classificacao =
        "PREENCHER_ID_INTERNO";

      produtoCandidato =
        produtoDireto.id;
    }

    plano.push({
      matriculaId: matricula.id,
      classificacao,
      produtoCandidato,
    });
  }

  return plano;
}

async function carregarPlanoLeads(tx) {
  const [leads, pessoas] = await Promise.all([
    tx.lead.findMany({
      orderBy: {
        createdAt: "asc",
      },

      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        pessoaId: true,

        aluno: {
          select: {
            id: true,
            pessoaId: true,
          },
        },

        transacoesHotmart: {
          select: {
            aluno: {
              select: {
                pessoaId: true,
              },
            },
          },
        },
      },
    }),

    tx.pessoa.findMany({
      select: {
        id: true,
        emailPrincipal: true,
        telefonePrincipal: true,

        lead: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const pessoaPorId = new Map(
    pessoas.map((pessoa) => [
      pessoa.id,
      pessoa,
    ]),
  );

  const plano = [];

  for (const lead of leads) {
    const email =
      normalizarEmail(lead.email);

    const telefone =
      normalizarTelefone(lead.whatsapp);

    if (!email) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "CONFLITO_EMAIL_INVALIDO",
        pessoaCandidataId: null,
        email,
        telefone,
      });

      continue;
    }

    if (lead.pessoaId) {
      const pessoa =
        pessoaPorId.get(lead.pessoaId);

      if (!pessoa) {
        plano.push({
          leadId: lead.id,
          classificacao:
            "CONFLITO_PESSOA_INEXISTENTE",
          pessoaCandidataId:
            lead.pessoaId,
          email,
          telefone,
        });

        continue;
      }

      if (
        normalizarEmail(
          pessoa.emailPrincipal,
        ) !== email
      ) {
        plano.push({
          leadId: lead.id,
          classificacao:
            "CONFLITO_VINCULO_EXISTENTE",
          pessoaCandidataId:
            lead.pessoaId,
          email,
          telefone,
        });

        continue;
      }

      plano.push({
        leadId: lead.id,
        classificacao:
          "JA_VINCULADO",
        pessoaCandidataId:
          lead.pessoaId,
        email,
        telefone,
      });

      continue;
    }

    const pessoasViaTransacao = [
      ...new Set(
        lead.transacoesHotmart
          .map(
            (transacao) =>
              transacao.aluno?.pessoaId,
          )
          .filter(Boolean),
      ),
    ];

    if (pessoasViaTransacao.length > 1) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "CONFLITO_TRANSACOES",
        pessoaCandidataId: null,
        email,
        telefone,
      });

      continue;
    }

    const pessoaViaAluno =
      lead.aluno?.pessoaId || null;

    const pessoaViaTransacao =
      pessoasViaTransacao[0] || null;

    if (
      pessoaViaAluno &&
      pessoaViaTransacao &&
      pessoaViaAluno !==
        pessoaViaTransacao
    ) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "CONFLITO_RELACIONAL",
        pessoaCandidataId: null,
        email,
        telefone,
      });

      continue;
    }

    const pessoaEstruturalId =
      pessoaViaAluno ||
      pessoaViaTransacao ||
      null;

    if (pessoaEstruturalId) {
      const pessoa =
        pessoaPorId.get(
          pessoaEstruturalId,
        );

      if (!pessoa) {
        plano.push({
          leadId: lead.id,
          classificacao:
            "CONFLITO_PESSOA_ESTRUTURAL_INEXISTENTE",
          pessoaCandidataId:
            pessoaEstruturalId,
          email,
          telefone,
        });

        continue;
      }

      if (
        pessoa.lead &&
        pessoa.lead.id !== lead.id
      ) {
        plano.push({
          leadId: lead.id,
          classificacao:
            "CONFLITO_PESSOA_JA_VINCULADA",
          pessoaCandidataId:
            pessoaEstruturalId,
          email,
          telefone,
        });

        continue;
      }

      if (
        normalizarEmail(
          pessoa.emailPrincipal,
        ) !== email
      ) {
        plano.push({
          leadId: lead.id,
          classificacao:
            "CONFLITO_EMAIL_RELACIONAL",
          pessoaCandidataId:
            pessoaEstruturalId,
          email,
          telefone,
        });

        continue;
      }

      plano.push({
        leadId: lead.id,
        classificacao:
          pessoaViaAluno
            ? "VINCULAR_ALUNO"
            : "VINCULAR_TRANSACAO",
        pessoaCandidataId:
          pessoaEstruturalId,
        email,
        telefone,
      });

      continue;
    }

    const pessoasMesmoEmail =
      pessoas.filter(
        (pessoa) =>
          normalizarEmail(
            pessoa.emailPrincipal,
          ) === email,
      );

    if (pessoasMesmoEmail.length > 1) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "CONFLITO_EMAIL",
        pessoaCandidataId: null,
        email,
        telefone,
      });

      continue;
    }

    if (pessoasMesmoEmail.length === 1) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "PRESERVAR_REVISAO_EMAIL",
        pessoaCandidataId:
          pessoasMesmoEmail[0].id,
        email,
        telefone,
      });

      continue;
    }

    const pessoasMesmoTelefone =
      telefone
        ? pessoas.filter(
            (pessoa) =>
              normalizarTelefone(
                pessoa.telefonePrincipal,
              ) === telefone,
          )
        : [];

    if (pessoasMesmoTelefone.length > 0) {
      plano.push({
        leadId: lead.id,
        classificacao:
          "PRESERVAR_REVISAO_TELEFONE",
        pessoaCandidataId:
          pessoasMesmoTelefone.length === 1
            ? pessoasMesmoTelefone[0].id
            : null,
        email,
        telefone,
      });

      continue;
    }

    plano.push({
      leadId: lead.id,
      classificacao:
        "CRIAR_PESSOA",
      pessoaCandidataId: null,
      email,
      telefone,
      telefoneOriginal:
        String(lead.whatsapp || "").trim() || null,
      nome: lead.nome,
    });
  }

  const candidatosCriacao =
    plano.filter(
      (item) =>
        item.classificacao ===
        "CRIAR_PESSOA",
    );

  const gruposEmail = new Map();
  const gruposTelefone = new Map();

  for (const item of candidatosCriacao) {
    if (!gruposEmail.has(item.email)) {
      gruposEmail.set(item.email, []);
    }

    gruposEmail
      .get(item.email)
      .push(item);

    if (item.telefone) {
      if (
        !gruposTelefone.has(
          item.telefone,
        )
      ) {
        gruposTelefone.set(
          item.telefone,
          [],
        );
      }

      gruposTelefone
        .get(item.telefone)
        .push(item);
    }
  }

  for (const grupo of gruposEmail.values()) {
    if (grupo.length > 1) {
      for (const item of grupo) {
        item.classificacao =
          "CONFLITO_LEADS_EMAIL";
      }
    }
  }

  for (
    const grupo
    of gruposTelefone.values()
  ) {
    if (grupo.length > 1) {
      for (const item of grupo) {
        if (
          item.classificacao ===
          "CRIAR_PESSOA"
        ) {
          item.classificacao =
            "CONFLITO_LEADS_TELEFONE";
        }
      }
    }
  }

  return plano;
}

async function capturarEstadoProtegido(tx) {
  const [
    alunos,
    usuarios,
    totalMatriculas,
    totalVigencias,
    totalDireitos,
    totalTransacoes,
    totalInteracoes,
  ] = await Promise.all([
    tx.aluno.findMany({
      orderBy: { id: "asc" },

      select: {
        id: true,
        pessoaId: true,
        senhaHash: true,
        status: true,
        origem: true,
      },
    }),

    tx.usuario.findMany({
      orderBy: { id: "asc" },

      select: {
        id: true,
        pessoaId: true,
        senhaHash: true,
        status: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        ultimoLoginEm: true,
      },
    }),

    tx.matricula.count(),
    tx.vigenciaMatricula.count(),
    tx.direitoConcedido.count(),
    tx.hotmartTransaction.count(),
    tx.interacaoMarketing.count(),
  ]);

  return {
    alunos: JSON.stringify(alunos),
    usuarios: JSON.stringify(usuarios),

    contagens: {
      matriculas: totalMatriculas,
      vigencias: totalVigencias,
      direitos: totalDireitos,
      transacoesHotmart:
        totalTransacoes,
      interacoesMarketing:
        totalInteracoes,
    },
  };
}

function validarEstadoProtegido(
  antes,
  depois,
) {
  if (antes.alunos !== depois.alunos) {
    throw new Error(
      "Backfill alterou dados protegidos de Aluno.",
    );
  }

  if (
    antes.usuarios !== depois.usuarios
  ) {
    throw new Error(
      "Backfill alterou Usuario ou credenciais.",
    );
  }

  for (
    const chave
    of Object.keys(antes.contagens)
  ) {
    if (
      antes.contagens[chave] !==
      depois.contagens[chave]
    ) {
      throw new Error(
        `Backfill alterou contagem protegida: ${chave}.`,
      );
    }
  }
}

async function aplicarProdutos(
  tx,
  plano,
) {
  const aplicaveis =
    plano.filter((item) =>
      item.classificacao.startsWith(
        "PREENCHER_",
      ),
    );

  for (const item of aplicaveis) {
    const resultado =
      await tx.matricula.updateMany({
        where: {
          id: item.matriculaId,
          produtoCatalogoId: null,
        },

        data: {
          produtoCatalogoId:
            item.produtoCandidato,
        },
      });

    if (resultado.count !== 1) {
      throw new Error(
        "Estado de Matricula mudou durante o backfill.",
      );
    }
  }

  return aplicaveis.length;
}

async function aplicarLeads(
  tx,
  plano,
) {
  let criadas = 0;
  let vinculadas = 0;

  for (const item of plano) {
    if (
      item.classificacao ===
      "CRIAR_PESSOA"
    ) {
      const pessoa =
        await tx.pessoa.create({
          data: {
            nome:
              item.nome || "Lead",
            emailPrincipal:
              item.email,
            telefonePrincipal:
              item.telefoneOriginal,
            ativo: true,
          },

          select: {
            id: true,
          },
        });

      const resultado =
        await tx.lead.updateMany({
          where: {
            id: item.leadId,
            pessoaId: null,
          },

          data: {
            pessoaId: pessoa.id,
          },
        });

      if (resultado.count !== 1) {
        throw new Error(
          "Estado de Lead mudou durante a criação de Pessoa.",
        );
      }

      criadas += 1;
      vinculadas += 1;

      continue;
    }

    if (
      item.classificacao ===
        "VINCULAR_ALUNO" ||
      item.classificacao ===
        "VINCULAR_TRANSACAO"
    ) {
      const resultado =
        await tx.lead.updateMany({
          where: {
            id: item.leadId,
            pessoaId: null,
          },

          data: {
            pessoaId:
              item.pessoaCandidataId,
          },
        });

      if (resultado.count !== 1) {
        throw new Error(
          "Estado de Lead mudou durante o vínculo com Pessoa.",
        );
      }

      vinculadas += 1;
    }
  }

  return {
    pessoasCriadas: criadas,
    leadsVinculados: vinculadas,
  };
}

function pendenciasProduto(plano) {
  return plano.filter((item) =>
    item.classificacao.startsWith(
      "PREENCHER_",
    ),
  );
}

function pendenciasLead(plano) {
  return plano.filter(
    (item) =>
      item.classificacao ===
        "CRIAR_PESSOA" ||
      item.classificacao ===
        "VINCULAR_ALUNO" ||
      item.classificacao ===
        "VINCULAR_TRANSACAO",
  );
}

async function main() {
  validarArgumentos();

  const resultado =
    await prisma.$transaction(
      async (tx) => {
        const estadoAntes =
          await capturarEstadoProtegido(
            tx,
          );

        const [
          planoProdutos,
          planoLeads,
        ] = await Promise.all([
          carregarPlanoProdutos(tx),
          carregarPlanoLeads(tx),
        ]);

        const conflitosProduto =
          possuiConflito(
            planoProdutos,
          );

        const conflitosLead =
          possuiConflito(
            planoLeads,
          );

        if (
          APLICAR &&
          (
            conflitosProduto ||
            conflitosLead
          )
        ) {
          throw new Error(
            "Existem conflitos no plano. Nenhuma alteração foi aplicada.",
          );
        }

        let aplicacao = {
          matriculasAtualizadas: 0,
          pessoasCriadas: 0,
          leadsVinculados: 0,
        };

        if (APLICAR) {
          aplicacao.matriculasAtualizadas =
            await aplicarProdutos(
              tx,
              planoProdutos,
            );

          const resultadoLeads =
            await aplicarLeads(
              tx,
              planoLeads,
            );

          aplicacao = {
            ...aplicacao,
            ...resultadoLeads,
          };

          const estadoDepois =
            await capturarEstadoProtegido(
              tx,
            );

          validarEstadoProtegido(
            estadoAntes,
            estadoDepois,
          );

          const [
            produtosDepois,
            leadsDepois,
          ] = await Promise.all([
            carregarPlanoProdutos(tx),
            carregarPlanoLeads(tx),
          ]);

          if (
            pendenciasProduto(
              produtosDepois,
            ).length !== 0
          ) {
            throw new Error(
              "Backfill de Produto não ficou idempotente.",
            );
          }

          if (
            pendenciasLead(
              leadsDepois,
            ).length !== 0
          ) {
            throw new Error(
              "Backfill de Lead não ficou idempotente.",
            );
          }
        }

        return {
          modo:
            APLICAR
              ? "APLICAR"
              : "DRY_RUN",

          ambienteDeclarado:
            AMBIENTE,

          produto: {
            classificacoes:
              contarPor(
                planoProdutos,
              ),

            pendentes:
              pendenciasProduto(
                planoProdutos,
              ).length,

            conflitos:
              planoProdutos
                .filter((item) =>
                  item.classificacao
                    .startsWith(
                      "CONFLITO_",
                    ),
                )
                .map((item) => ({
                  matriculaId:
                    item.matriculaId,
                  classificacao:
                    item.classificacao,
                })),
          },

          lead: {
            classificacoes:
              contarPor(
                planoLeads,
              ),

            pendentes:
              pendenciasLead(
                planoLeads,
              ).length,

            revisao:
              planoLeads
                .filter((item) =>
                  item.classificacao
                    .startsWith(
                      "PRESERVAR_REVISAO_",
                    ),
                )
                .map((item) => ({
                  leadId:
                    item.leadId,
                  classificacao:
                    item.classificacao,
                })),

            conflitos:
              planoLeads
                .filter((item) =>
                  item.classificacao
                    .startsWith(
                      "CONFLITO_",
                    ),
                )
                .map((item) => ({
                  leadId:
                    item.leadId,
                  classificacao:
                    item.classificacao,
                })),
          },

          aplicacao,
        };
      },
      {
        maxWait: 10000,
        timeout: 120000,
      },
    );

  console.dir(
    resultado,
    {
      depth: null,
    },
  );
}

const EXECUCAO_DIRETA =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) ===
    fileURLToPath(import.meta.url);

if (EXECUCAO_DIRETA) {
  main()
    .catch((erro) => {
      console.error(
        erro?.message || erro,
      );

      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export {
  carregarPlanoProdutos,
  carregarPlanoLeads,
  possuiConflito,
  validarEstadoProtegido,
  pendenciasProduto,
  pendenciasLead,
};
