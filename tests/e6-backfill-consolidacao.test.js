import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  carregarPlanoProdutos,
  carregarPlanoLeads,
  possuiConflito,
  validarEstadoProtegido,
  pendenciasProduto,
  pendenciasLead,
} from "../scripts/e6-backfill-consolidacao.mjs";


describe("E6.6 - backfill de Produto", () => {
  it("reconhece estado já migrado e preserva TESTE_LOCAL", async () => {
    const tx = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "mat-hotmart",
            origem: "HOTMART",
            produtoId: "8343505",
            produtoCatalogoId:
              "prod_garimpo_sem_mentoria",
            transacoesHotmart: [
              {
                produtoCatalogoId:
                  "prod_garimpo_sem_mentoria",
              },
            ],
          },
          {
            id: "mat-manual",
            origem: "MANUAL",
            produtoId: "TESTE_LOCAL",
            produtoCatalogoId: null,
            transacoesHotmart: [],
          },
        ]),
      },

      produtoIntegracao: {
        findUnique: vi.fn(
          async ({ where }) => {
            if (
              where.provedor_externalId
                .externalId === "8343505"
            ) {
              return {
                produtoId:
                  "prod_garimpo_sem_mentoria",
                ativo: true,
              };
            }

            return null;
          },
        ),
      },

      produto: {
        findUnique: vi
          .fn()
          .mockResolvedValue(null),
      },
    };

    const plano =
      await carregarPlanoProdutos(tx);

    expect(plano).toEqual([
      {
        matriculaId: "mat-hotmart",
        classificacao: "JA_PREENCHIDA",
        produtoCandidato:
          "prod_garimpo_sem_mentoria",
      },
      {
        matriculaId: "mat-manual",
        classificacao:
          "PRESERVAR_SEM_ASSOCIACAO",
        produtoCandidato: null,
      },
    ]);

    expect(
      pendenciasProduto(plano),
    ).toHaveLength(0);

    expect(
      possuiConflito(plano),
    ).toBe(false);
  });


  it("detecta divergência entre catálogo e transação", async () => {
    const tx = {
      matricula: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "mat-conflito",
            origem: "HOTMART",
            produtoId: "8343505",
            produtoCatalogoId: "produto-a",
            transacoesHotmart: [
              {
                produtoCatalogoId:
                  "produto-b",
              },
            ],
          },
        ]),
      },

      produtoIntegracao: {
        findUnique: vi
          .fn()
          .mockResolvedValue({
            produtoId: "produto-b",
            ativo: true,
          }),
      },

      produto: {
        findUnique: vi
          .fn()
          .mockResolvedValue(null),
      },
    };

    const plano =
      await carregarPlanoProdutos(tx);

    expect(
      plano[0].classificacao,
    ).toBe(
      "CONFLITO_CATALOGO_TRANSACAO",
    );

    expect(
      possuiConflito(plano),
    ).toBe(true);
  });
});


describe("E6.6 - backfill de Lead", () => {
  it("reconhece Lead já vinculado e preserva coincidência apenas por e-mail", async () => {
    const tx = {
      lead: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "lead-vinculado",
            nome: "Lead Um",
            email: "um@example.test",
            whatsapp: null,
            pessoaId: "pessoa-1",
            aluno: null,
            transacoesHotmart: [],
          },
          {
            id: "lead-revisao",
            nome: "Lead Dois",
            email: "dois@example.test",
            whatsapp: null,
            pessoaId: null,
            aluno: null,
            transacoesHotmart: [],
          },
        ]),
      },

      pessoa: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "pessoa-1",
            emailPrincipal:
              "um@example.test",
            telefonePrincipal: null,
            lead: {
              id: "lead-vinculado",
            },
          },
          {
            id: "pessoa-2",
            emailPrincipal:
              "dois@example.test",
            telefonePrincipal: null,
            lead: null,
          },
        ]),
      },
    };

    const plano =
      await carregarPlanoLeads(tx);

    expect(
      plano.find(
        (item) =>
          item.leadId ===
          "lead-vinculado",
      ).classificacao,
    ).toBe("JA_VINCULADO");

    expect(
      plano.find(
        (item) =>
          item.leadId ===
          "lead-revisao",
      ).classificacao,
    ).toBe(
      "PRESERVAR_REVISAO_EMAIL",
    );

    expect(
      pendenciasLead(plano),
    ).toHaveLength(0);

    expect(
      possuiConflito(plano),
    ).toBe(false);
  });


  it("separa telefone normalizado do valor original preservado", async () => {
    const tx = {
      lead: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "lead-novo",
            nome: "Lead Novo",
            email:
              " NOVO@example.test ",
            whatsapp:
              "(41) 99999-9999",
            pessoaId: null,
            aluno: null,
            transacoesHotmart: [],
          },
        ]),
      },

      pessoa: {
        findMany: vi
          .fn()
          .mockResolvedValue([]),
      },
    };

    const plano =
      await carregarPlanoLeads(tx);

    expect(plano[0]).toMatchObject({
      leadId: "lead-novo",
      classificacao:
        "CRIAR_PESSOA",
      email: "novo@example.test",
      telefone: "41999999999",
      telefoneOriginal:
        "(41) 99999-9999",
      nome: "Lead Novo",
    });

    expect(
      pendenciasLead(plano),
    ).toHaveLength(1);
  });


  it("detecta colisão entre Leads candidatos pelo mesmo e-mail", async () => {
    const tx = {
      lead: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "lead-a",
            nome: "A",
            email: "mesmo@example.test",
            whatsapp: null,
            pessoaId: null,
            aluno: null,
            transacoesHotmart: [],
          },
          {
            id: "lead-b",
            nome: "B",
            email: "MESMO@example.test",
            whatsapp: null,
            pessoaId: null,
            aluno: null,
            transacoesHotmart: [],
          },
        ]),
      },

      pessoa: {
        findMany: vi
          .fn()
          .mockResolvedValue([]),
      },
    };

    const plano =
      await carregarPlanoLeads(tx);

    expect(
      plano.every(
        (item) =>
          item.classificacao ===
          "CONFLITO_LEADS_EMAIL",
      ),
    ).toBe(true);

    expect(
      possuiConflito(plano),
    ).toBe(true);
  });
});


describe("E6.6 - proteção do estado", () => {
  it("aceita estado protegido inalterado", () => {
    const estado = {
      alunos:
        JSON.stringify([
          {
            id: "aluno-1",
            senhaHash: "hash",
          },
        ]),

      usuarios:
        JSON.stringify([
          {
            id: "usuario-1",
            senhaHash: "hash",
          },
        ]),

      contagens: {
        matriculas: 12,
        vigencias: 21,
        direitos: 15,
        transacoesHotmart: 27,
        interacoesMarketing: 0,
      },
    };

    expect(() =>
      validarEstadoProtegido(
        estado,
        structuredClone(estado),
      ),
    ).not.toThrow();
  });


  it("recusa alteração de credencial de Usuario", () => {
    const antes = {
      alunos: "[]",

      usuarios:
        JSON.stringify([
          {
            id: "usuario-1",
            senhaHash: "antes",
          },
        ]),

      contagens: {
        matriculas: 12,
        vigencias: 21,
        direitos: 15,
        transacoesHotmart: 27,
        interacoesMarketing: 0,
      },
    };

    const depois = {
      ...antes,

      usuarios:
        JSON.stringify([
          {
            id: "usuario-1",
            senhaHash: "depois",
          },
        ]),
    };

    expect(() =>
      validarEstadoProtegido(
        antes,
        depois,
      ),
    ).toThrow(
      "Backfill alterou Usuario ou credenciais.",
    );
  });
});
