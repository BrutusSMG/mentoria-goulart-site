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
  enviarEmail: vi.fn(),
  enviarBrevo: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      upsert: mocks.upsert,
    },
  },
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

  // Valor fictício: o Resend está substituído por um mock.
  vi.stubEnv("RESEND_API_KEY", "chave_ficticia_para_teste");

  mocks.upsert.mockResolvedValue({
    id: "lead_teste_1",
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

describe("POST /api/leads — normalização de e-mail", () => {
  it("utiliza o mesmo e-mail normalizado no banco e no envio", async () => {
    const resposta1 = await POST(
      requisicaoLead(" Fabio@Dominio.com "),
    );

    const resposta2 = await POST(
      requisicaoLead("fabio@dominio.com"),
    );

    expect(resposta1.status).toBe(200);
    expect(resposta2.status).toBe(200);

    expect(mocks.upsert).toHaveBeenCalledTimes(2);
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
    }

    for (const chamada of mocks.enviarEmail.mock.calls) {
      expect(chamada[0].to).toBe(
        "fabio@dominio.com",
      );
    }

    for (const chamada of mocks.enviarBrevo.mock.calls) {
      const [url, opcoes] = chamada;

      expect(url).toBe("https://api.brevo.com/v3/contacts");

      expect(JSON.parse(opcoes.body).email).toBe(
        "fabio@dominio.com",
      );
    }
  });
});