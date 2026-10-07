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
    pessoaId: null,
  });

  mocks.garantirIdentidadeLead.mockImplementation(
    async (_tx, lead) => ({
      ...lead,
      pessoaId: "pessoa_teste_1",
    }),
  );

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

function requisicaoLead(email) {
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
    }),
  });
}

describe("POST /api/leads — normalização e identidade", () => {
  it("utiliza o mesmo e-mail normalizado no banco e no envio", async () => {
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

    expect(
      mocks.garantirIdentidadeLead,
    ).toHaveBeenCalledTimes(2);

    expect(mocks.enviarEmail).toHaveBeenCalledTimes(2);
    expect(mocks.enviarBrevo).toHaveBeenCalledTimes(2);

    for (const chamada of mocks.upsert.mock.calls) {
      const dados = chamada[0];

      expect(dados.where).toEqual({
        email: "fabio@dominio.com",
      });

      expect(dados.create.email).toBe(
        "fabio@dominio.com",
      );

      // O comportamento legado permanece até a E6.3.
      expect(dados.update.baixouEbook).toBe(false);
    }

    for (
      const chamada of
      mocks.garantirIdentidadeLead.mock.calls
    ) {
      const [, lead] = chamada;

      expect(lead).toEqual(
        expect.objectContaining({
          id: "lead_teste_1",
          email: "fabio@dominio.com",
        }),
      );
    }

    for (const chamada of mocks.enviarEmail.mock.calls) {
      expect(chamada[0].to).toBe(
        "fabio@dominio.com",
      );
    }

    for (const chamada of mocks.enviarBrevo.mock.calls) {
      const [url, opcoes] = chamada;

      expect(url).toBe(
        "https://api.brevo.com/v3/contacts",
      );

      expect(JSON.parse(opcoes.body).email).toBe(
        "fabio@dominio.com",
      );
    }
  });

  it("consolida Pessoa dentro da mesma transação do Lead", async () => {
    const resposta = await POST(
      requisicaoLead("fabio@dominio.com"),
    );

    expect(resposta.status).toBe(200);

    expect(mocks.transaction).toHaveBeenCalledOnce();

    expect(mocks.upsert).toHaveBeenCalledOnce();

    expect(
      mocks.garantirIdentidadeLead,
    ).toHaveBeenCalledOnce();

    const tx =
      mocks.transaction.mock.calls[0][0];

    expect(typeof tx).toBe("function");

    const body = await resposta.json();

    expect(body).toEqual({
      success: true,
      leadId: "lead_teste_1",
    });
  });
});
