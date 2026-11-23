import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  acesso: vi.fn(),
  limite: vi.fn(),
  respostaNegada: vi.fn(),
  prisma: {
    pessoa: { count: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(),
  },
  tx: { pessoa: { findMany: vi.fn(), create: vi.fn() } },
}));

vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAdmin: mock.acesso,
  respostaAcessoNegado: mock.respostaNegada,
  prisma: mock.prisma,
}));

vi.mock("@/lib/limite-pessoas-admin", () => ({
  verificarLimitePessoasAdmin: mock.limite,
  ErroLimitePessoasAdmin: class ErroLimitePessoasAdmin extends Error {
    constructor(codigo, status, retryAfter = null) {
      super(codigo);
      this.codigo = codigo;
      this.status = status;
      this.retryAfter = retryAfter;
    }
  },
}));

import { GET, POST } from "../src/app/api/admin/pessoas/route.js";
import { ErroLimitePessoasAdmin } from "../src/lib/limite-pessoas-admin.js";

const BASE = "http://localhost:3000/api/admin/pessoas";
const admin = () => ({
  permitido: true,
  ehAdmin: true,
  conta: {
    role: "ADMIN",
    ativo: true,
    usuarioId: "usuario_admin",
    mustChangePassword: false,
  },
});

function requisicao(method, caminho = "", body, headers = {}) {
  return new Request(BASE + caminho, {
    method,
    headers: {
      origin: "http://localhost:3000",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.MGU_E72_ADMIN_ORIGINS = "http://localhost:3000";
  mock.acesso.mockResolvedValue(admin());
  mock.limite.mockResolvedValue({ restante: 20 });
  mock.respostaNegada.mockImplementation((acesso) => Response.json(
    { code: "ACESSO_NEGADO", error: "Acesso negado." },
    { status: acesso.status || 403 },
  ));
  mock.prisma.pessoa.count.mockResolvedValue(1);
  mock.prisma.pessoa.findMany.mockResolvedValue([
    { id: "p_1", nome: "Maria", emailPrincipal: "maria@example.com", ativo: true },
  ]);
  mock.tx.pessoa.findMany.mockResolvedValue([]);
  mock.tx.pessoa.create.mockResolvedValue({
    id: "p_2", nome: "Joana", emailPrincipal: "joana@example.com", ativo: true,
  });
  mock.prisma.$transaction.mockImplementation((fn) => fn(mock.tx));
});

afterEach(() => { delete process.env.MGU_E72_ADMIN_ORIGINS; });

describe("E7.3: contrato HTTP de Pessoas", () => {
  it.each(["GET", "POST"])("nega sessão ausente antes de acessar o banco: %s", async (method) => {
    mock.acesso.mockResolvedValue({ permitido: false, status: 401, motivo: "Não autorizado." });
    const res = await (method === "GET"
      ? GET(requisicao("GET", "?q=Maria"))
      : POST(requisicao("POST", "", { nome: "Joana", emailPrincipal: "joana@example.com" })));
    expect(res.status).toBe(401);
    expect(mock.prisma.pessoa.count).not.toHaveBeenCalled();
    expect(mock.limite).not.toHaveBeenCalled();
    expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([
    ["PARCEIRO", { role: "PARCEIRO" }],
    ["inativo", { ativo: false }],
    ["senha pendente", { mustChangePassword: true }],
    ["identidade inválida", { usuarioId: " id inválido " }],
  ])("nega %s mesmo com permitido=true", async (_motivo, campos) => {
    mock.acesso.mockResolvedValue({ ...admin(), conta: { ...admin().conta, ...campos } });
    const res = await GET(requisicao("GET", "?q=Maria"));
    expect(res.status).toBe(403);
    expect(mock.prisma.pessoa.count).not.toHaveBeenCalled();
  });

  it("busca com paginação e não expõe campos internos", async () => {
    mock.prisma.pessoa.findMany.mockResolvedValue([{
      id: "p_1", nome: "Maria", emailPrincipal: "maria@example.com",
      ativo: true, senhaHash: "NÃO EXPOR",
    }]);
    // O serviço especifica SELECT mínimo, não depende de filtragem posterior da resposta.
    const res = await GET(requisicao("GET", "?q=Maria&page=2&pageSize=5"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(mock.prisma.pessoa.findMany).toHaveBeenCalledWith(expect.objectContaining({
      select: { id: true, nome: true, emailPrincipal: true, ativo: true },
      skip: 5, take: 5,
    }));
    const dados = await res.json();
    expect(dados.pagination).toEqual({ page: 2, pageSize: 5, total: 1, totalPages: 1 });
  });

  it.each([
    "", "?q=a", "?q=Maria&page=0", "?q=Maria&pageSize=51",
    "?q=Maria&q=Joana", "?q=Maria&extra=1",
  ])("rejeita busca inválida sem consultar Pessoas: %s", async (query) => {
    const res = await GET(requisicao("GET", query));
    expect(res.status).toBe(400);
    expect(mock.prisma.pessoa.count).not.toHaveBeenCalled();
  });

  it.each([
    ["Origin externo", { origin: "https://atacante.example" }],
    ["Origin ausente", { origin: "" }],
    ["Sec-Fetch-Site cross-site", { "sec-fetch-site": "cross-site" }],
    ["Sec-Fetch-Site same-site", { "sec-fetch-site": "same-site" }],
  ])("bloqueia POST com %s", async (_motivo, headers) => {
    const res = await POST(requisicao("POST", "", {
      nome: "Joana", emailPrincipal: "joana@example.com",
    }, headers));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("ORIGEM_NAO_AUTORIZADA");
    expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("falha fechado sem allowlist de Origin", async () => {
    delete process.env.MGU_E72_ADMIN_ORIGINS;
    const res = await POST(requisicao("POST", "", {
      nome: "Joana", emailPrincipal: "joana@example.com",
    }));
    expect(res.status).toBe(403);
    expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("recusa JSON inválido, tipo incorreto, URL com query e corpo acima de 16 KiB", async () => {
    const headers = { origin: "http://localhost:3000", "content-type": "application/json" };
    const requests = [
      new Request(BASE, { method: "POST", headers, body: "{invalido" }),
      new Request(BASE, { method: "POST",
        headers: { ...headers, "content-type": "text/plain" }, body: "{}" }),
      requisicao("POST", "?q=Joana", { nome: "Joana", emailPrincipal: "joana@example.com" }),
      requisicao("POST", "", { nome: "J".repeat(17000), emailPrincipal: "joana@example.com" }),
      new Request(BASE, { method: "POST", headers, body: new Uint8Array([0xc3, 0x28]) }),
    ];
    for (const req of requests) {
      const res = await POST(req);
      expect(res.status).toBe(400);
    }
    expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("cria Pessoa com autoria canônica e sem criar outros papéis", async () => {
    const res = await POST(requisicao("POST", "", {
      nome: " Joana ", emailPrincipal: " JOANA@EXAMPLE.COM ",
    }));
    expect(res.status).toBe(201);
    expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(mock.tx.pessoa.create).toHaveBeenCalledWith({
      data: {
        nome: "Joana", emailPrincipal: "joana@example.com",
        telefonePrincipal: null, criadoPorUsuarioId: "usuario_admin",
      },
      select: { id: true, nome: true, emailPrincipal: true, ativo: true },
    });
    expect(Object.keys(mock.tx)).toEqual(["pessoa"]);
  });

  it("retorna 409 para duplicidade pré-existente", async () => {
    mock.tx.pessoa.findMany.mockResolvedValue([{ id: "p_existente" }]);
    const res = await POST(requisicao("POST", "", {
      nome: "Joana", emailPrincipal: "joana@example.com",
    }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("EMAIL_EM_USO");
    expect(mock.tx.pessoa.create).not.toHaveBeenCalled();
  });

  it("traduz colisão de índice único surgida durante o INSERT", async () => {
    mock.tx.pessoa.create.mockRejectedValue({
      code: "P2002", meta: { target: "Pessoa_emailPrincipal_normalizado_uidx" },
    });
    const res = await POST(requisicao("POST", "", {
      nome: "Joana", emailPrincipal: "joana@example.com",
    }));
    expect(res.status).toBe(409);
    expect((await res.json()).code).toBe("EMAIL_EM_USO");
  });

  it("aplica limite somente apos validar ADMIN e antes de acessar Pessoas", async () => {
    const res = await GET(requisicao("GET", "?q=Maria"));
    expect(res.status).toBe(200);
    expect(mock.limite).toHaveBeenCalledWith({
      prisma: mock.prisma, usuarioId: "usuario_admin", operacao: "GET",
    });
  });

  it("responde 429 com Retry-After sem consultar dados", async () => {
    mock.limite.mockRejectedValue(new ErroLimitePessoasAdmin("LIMITE_EXCEDIDO", 429, 42));
    const res = await GET(requisicao("GET", "?q=Maria"));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
    expect((await res.json()).code).toBe("LIMITE_EXCEDIDO");
    expect(mock.prisma.pessoa.count).not.toHaveBeenCalled();
  });

  it("falha fechado com 503 se o controle distribuido estiver indisponivel", async () => {
    mock.limite.mockRejectedValue(new ErroLimitePessoasAdmin("LIMITE_INDISPONIVEL", 503, 60));
    const res = await POST(requisicao("POST", "", {
      nome: "Joana", emailPrincipal: "joana@example.com",
    }));
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("60");
    expect(mock.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("não revela detalhes de falhas desconhecidas do banco", async () => {
    mock.prisma.pessoa.count.mockRejectedValue(new Error("token privado do banco"));
    const res = await GET(requisicao("GET", "?q=Maria"));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ code: "ERRO_INTERNO", error: "Erro interno." });
  });
});
