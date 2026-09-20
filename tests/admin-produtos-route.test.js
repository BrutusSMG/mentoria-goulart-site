import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  obterAcessoAdmin: vi.fn(),
  respostaAcessoNegado: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAdmin: mocks.obterAcessoAdmin,
  respostaAcessoNegado: mocks.respostaAcessoNegado,
  prisma: {
    produto: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

import { GET } from "@/app/api/admin/produtos/route";
import { PUT } from "@/app/api/admin/produtos/[id]/route";

function decimal(valor) {
  return {
    toString() {
      return valor;
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.obterAcessoAdmin.mockResolvedValue({
    permitido: true,
    status: 200,
    conta: {
      id: "admin_1",
      role: "ADMIN",
    },
    ehAdmin: true,
  });

  mocks.respostaAcessoNegado.mockImplementation(
    (acesso) =>
      Response.json(
        {
          error: acesso.motivo || "Acesso negado.",
        },
        {
          status: acesso.status || 403,
        },
      ),
  );
});

describe("GET /api/admin/produtos", () => {
  it("bloqueia conta sem acesso administrativo", async () => {
    mocks.obterAcessoAdmin.mockResolvedValue({
      permitido: false,
      status: 403,
      motivo: "Acesso restrito.",
    });

    const resposta = await GET();

    expect(resposta.status).toBe(403);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("lista produtos com valores monetarios serializaveis", async () => {
    mocks.findMany.mockResolvedValue([
      {
        id: "prod_1",
        nome: "Produto 1",
        slug: "produto-1",
        tipo: "CURSO",
        ativo: true,
        preco: decimal("147"),
        precoPromocional: null,
        moeda: "BRL",
      },
    ]);

    const resposta = await GET();
    const body = await resposta.json();

    expect(resposta.status).toBe(200);
    expect(
      resposta.headers.get("cache-control"),
    ).toContain("no-store");

    expect(body).toEqual([
      {
        id: "prod_1",
        nome: "Produto 1",
        slug: "produto-1",
        tipo: "CURSO",
        ativo: true,
        preco: "147",
        precoPromocional: null,
        moeda: "BRL",
      },
    ]);
  });
});

describe("PUT /api/admin/produtos/[id]", () => {
  it("bloqueia conta sem acesso administrativo", async () => {
    mocks.obterAcessoAdmin.mockResolvedValue({
      permitido: false,
      status: 403,
      motivo: "Acesso restrito.",
    });

    const req = new Request(
      "http://localhost/api/admin/produtos/prod_1",
      {
        method: "PUT",
        body: JSON.stringify({
          preco: "198.00",
        }),
      },
    );

    const resposta = await PUT(req, {
      params: Promise.resolve({
        id: "prod_1",
      }),
    });

    expect(resposta.status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejeita preco com formato invalido", async () => {
    const valoresInvalidos = [
      "-1",
      "49.999",
      "1e3",
      "10000000000.00",
    ];

    for (const preco of valoresInvalidos) {
      const req = new Request(
        "http://localhost/api/admin/produtos/prod_1",
        {
          method: "PUT",
          body: JSON.stringify({ preco }),
        },
      );

      const resposta = await PUT(req, {
        params: Promise.resolve({
          id: "prod_1",
        }),
      });

      expect(resposta.status).toBe(400);
    }

    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("retorna 404 para produto inexistente", async () => {
    mocks.findUnique.mockResolvedValue(null);

    const req = new Request(
      "http://localhost/api/admin/produtos/inexistente",
      {
        method: "PUT",
        body: JSON.stringify({
          preco: "198.00",
        }),
      },
    );

    const resposta = await PUT(req, {
      params: Promise.resolve({
        id: "inexistente",
      }),
    });

    expect(resposta.status).toBe(404);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("altera somente o preco corrente", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "prod_1",
    });

    mocks.update.mockResolvedValue({
      id: "prod_1",
      nome: "Produto Original",
      slug: "produto-original",
      tipo: "EBOOK",
      ativo: true,
      preco: decimal("199.90"),
      precoPromocional: null,
      moeda: "BRL",
    });

    const req = new Request(
      "http://localhost/api/admin/produtos/prod_1",
      {
        method: "PUT",
        body: JSON.stringify({
          preco: "199.90",
          nome: "Nome adulterado",
          ativo: false,
          moeda: "USD",
          precoPromocional: "1.00",
        }),
      },
    );

    const resposta = await PUT(req, {
      params: Promise.resolve({
        id: "prod_1",
      }),
    });

    const body = await resposta.json();

    expect(resposta.status).toBe(200);

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "prod_1",
        },
        data: {
          preco: "199.90",
        },
      }),
    );

    expect(body).toEqual({
      id: "prod_1",
      nome: "Produto Original",
      slug: "produto-original",
      tipo: "EBOOK",
      ativo: true,
      preco: "199.90",
      precoPromocional: null,
      moeda: "BRL",
    });
  });

  it("normaliza valor inteiro para duas casas decimais", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "prod_1",
    });

    mocks.update.mockResolvedValue({
      id: "prod_1",
      nome: "Produto 1",
      slug: "produto-1",
      tipo: "CURSO",
      ativo: true,
      preco: decimal("997.00"),
      precoPromocional: null,
      moeda: "BRL",
    });

    const req = new Request(
      "http://localhost/api/admin/produtos/prod_1",
      {
        method: "PUT",
        body: JSON.stringify({
          preco: "997",
        }),
      },
    );

    await PUT(req, {
      params: Promise.resolve({
        id: "prod_1",
      }),
    });

    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          preco: "997.00",
        },
      }),
    );
  });
});
