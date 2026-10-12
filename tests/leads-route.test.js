import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  transaction: vi.fn(),
  garantirIdentidadeLead: vi.fn(),
  registrarInteracaoMarketing: vi.fn(),
  enviarEmail: vi.fn(),
  enviarBrevo: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/garantir-identidade-lead", () => ({
  garantirIdentidadeLeadCapturado:
    mocks.garantirIdentidadeLead,
}));

vi.mock("@/lib/interacao-marketing", () => ({
  TIPOS_INTERACAO_MARKETING: {
    EBOOK_SOLICITADO: "EBOOK_SOLICITADO",
    EBOOK_DOWNLOAD: "EBOOK_DOWNLOAD",
    JORNADA_CONTRIBUICAO: "JORNADA_CONTRIBUICAO",
  },
  registrarInteracaoMarketing:
    mocks.registrarInteracaoMarketing,
}));

vi.mock("resend", () => ({
  Resend: class {
    constructor() {
      this.emails = {
        send: mocks.enviarEmail,
      };
    }
  },
}));

import { POST } from "@/app/api/leads/route";

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubEnv(
    "RESEND_API_KEY",
    "chave_ficticia_para_teste",
  );

  mocks.transaction.mockImplementation(
    async (callback) => callback({
      lead: {
        upsert: mocks.upsert,
      },
    }),
  );

  mocks.upsert.mockResolvedValue({
    id: "lead_teste_1",
    nome: "Fabio Teste",
    email: "fabio@dominio.com",
    whatsapp: "",
    baixouEbook: true,
    pessoaId: null,
  });

  mocks.garantirIdentidadeLead.mockImplementation(
    async (_tx, lead) => ({
      ...lead,
      pessoaId: "pessoa_teste_1",
    }),
  );

  mocks.registrarInteracaoMarketing.mockResolvedValue({
    id: "interacao_teste_1",
  });

  mocks.enviarEmail.mockResolvedValue({
    data: { id: "email_teste_1" },
    error: null,
  });

  mocks.enviarBrevo.mockResolvedValue({
    ok: true,
    status: 201,
  });

  vi.stubGlobal("fetch", mocks.enviarBrevo);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function requisicaoLead(
  email,
  sobrescritas = {},
) {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      nome: "Fabio Teste",
      email,
      whatsapp: "",
      utms: {},
      ...sobrescritas,
    }),
  });
}

describe("POST /api/leads — identidade e histórico", () => {
  it("normaliza o e-mail e não reseta baixouEbook em recapturas", async () => {
    const resposta1 = await POST(
      requisicaoLead(" Fabio@Dominio.com "),
    );

    const resposta2 = await POST(
      requisicaoLead("fabio@dominio.com"),
    );

    expect(resposta1.status).toBe(200);
    expect(resposta2.status).toBe(200);

    expect(mocks.transaction).toHaveBeenCalledTimes(2);
    expect(mocks.upsert).toHaveBeenCalledTimes(2);

    for (const chamada of mocks.upsert.mock.calls) {
      const dados = chamada[0];

      expect(dados.where).toEqual({
        email: "fabio@dominio.com",
      });

      expect(dados.create.email).toBe(
        "fabio@dominio.com",
      );

      expect(dados.create.baixouEbook).toBe(false);

      expect(dados.update).not.toHaveProperty(
        "baixouEbook",
      );
    }

    expect(mocks.enviarEmail).toHaveBeenCalledTimes(2);
    expect(mocks.enviarBrevo).toHaveBeenCalledTimes(2);
  });

  it("consolida Pessoa e registra EBOOK_SOLICITADO na mesma transação", async () => {
    const resposta = await POST(
      requisicaoLead(
        "fabio@dominio.com",
        {
          origem: "Subdominio - Anuncio Ebook",
          utms: {
            utm_source: "instagram",
            utm_medium: "social",
            utm_campaign: "campanha-e6",
            utm_term: "garimpo",
            utm_content: "criativo-1",
          },
        },
      ),
    );

    expect(resposta.status).toBe(200);

    expect(
      mocks.garantirIdentidadeLead,
    ).toHaveBeenCalledOnce();

    expect(
      mocks.registrarInteracaoMarketing,
    ).toHaveBeenCalledOnce();

    const [
      txInteracao,
      dadosInteracao,
    ] =
      mocks.registrarInteracaoMarketing
        .mock.calls[0];

    expect(txInteracao).toBeTruthy();

    expect(dadosInteracao).toEqual({
      pessoaId: "pessoa_teste_1",
      tipo: "EBOOK_SOLICITADO",
      origem: "Subdominio - Anuncio Ebook",
      utmSource: "instagram",
      utmMedium: "social",
      utmCampaign: "campanha-e6",
      utmTerm: "garimpo",
      utmContent: "criativo-1",
    });

    const body = await resposta.json();

    expect(body).toEqual({
      success: true,
      leadId: "lead_teste_1",
    });
  });

  it("não inventa campanha no histórico quando a captura não possui UTM", async () => {
    const resposta = await POST(
      requisicaoLead(
        "fabio@dominio.com",
        {
          origem: "Isca Digital - Ebook",
          utms: {},
        },
      ),
    );

    expect(resposta.status).toBe(200);

    const [, dadosInteracao] =
      mocks.registrarInteracaoMarketing
        .mock.calls[0];

    expect(dadosInteracao).toEqual({
      pessoaId: "pessoa_teste_1",
      tipo: "EBOOK_SOLICITADO",
      origem: "Isca Digital - Ebook",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    });

    const dadosLead =
      mocks.upsert.mock.calls[0][0];

    // Compatibilidade temporária do painel:
    expect(dadosLead.update.utmCampaign).toBe(
      "Acesso direto",
    );
  });
});
