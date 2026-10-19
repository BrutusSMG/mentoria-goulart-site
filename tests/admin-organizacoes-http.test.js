import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => {
  const servicos = Object.fromEntries([
    "criar", "editar", "decidirValidacao", "alterarOperacao", "criarVinculo",
    "editarFuncaoVinculo", "ativarVinculo", "encerrarVinculo", "definirPrincipal",
  ].map((nome) => [nome, vi.fn()]));
  return {
    acesso: vi.fn(),
    respostaNegada: vi.fn(),
    prisma: {
      organizacao: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
      pessoaOrganizacao: { count: vi.fn(), findMany: vi.fn() },
    },
    construir: vi.fn(),
    servicos,
  };
});
vi.mock("@/lib/admin-permissoes", () => ({
  obterAcessoAdmin: mock.acesso,
  prisma: mock.prisma,
  respostaAcessoNegado: mock.respostaNegada,
}));
vi.mock("@/lib/servicos-organizacao", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ErroDominioOrganizacao: original.ErroDominioOrganizacao,
    traduzirErroUnicidadeOrganizacao: original.traduzirErroUnicidadeOrganizacao,
    criarServicosOrganizacao: mock.construir,
  };
});

import { GET as listar, POST as criar } from "../src/app/api/admin/organizacoes/route.js";
import { GET as obter, PATCH as editar } from "../src/app/api/admin/organizacoes/[id]/route.js";
import { POST as validar } from "../src/app/api/admin/organizacoes/[id]/validacao/route.js";
import { POST as operar } from "../src/app/api/admin/organizacoes/[id]/operacao/route.js";
import { GET as listarVinculos, POST as criarVinculo } from "../src/app/api/admin/organizacoes/[id]/vinculos/route.js";
import { PATCH as editarVinculo } from "../src/app/api/admin/organizacoes/[id]/vinculos/[vinculoId]/route.js";
import { POST as ativar } from "../src/app/api/admin/organizacoes/[id]/vinculos/[vinculoId]/ativar/route.js";
import { POST as encerrar } from "../src/app/api/admin/organizacoes/[id]/vinculos/[vinculoId]/encerrar/route.js";
import { PUT as principal } from "../src/app/api/admin/organizacoes/[id]/principal/route.js";
import { origemMutacaoPermitida } from "../src/lib/http-organizacoes-admin.js";

const BASE = "http://localhost:3000/api/admin/organizacoes";
const rota = (metodo, path = "", body, extras = {}) => {
  const headers = { "content-type": "application/json", origin: "http://localhost:3000", ...extras };
  return new Request(BASE + path, {
    method: metodo, headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
};
const contexto = { params: Promise.resolve({ id: "org_1", vinculoId: "vin_1" }) };
const admin = () => ({
  permitido: true, ehAdmin: true,
  conta: { role: "ADMIN", ativo: true, usuarioId: "usuario_canonico", mustChangePassword: false },
});
const operacoes = [
  ["GET", listar, "", undefined, "organizacao"],
  ["POST", criar, "", { nomeFantasia: "Empresa" }, "criar"],
  ["GET", obter, "/org_1", undefined, "organizacao"],
  ["PATCH", editar, "/org_1", { nomeFantasia: "Alterada" }, "editar"],
  ["POST", validar, "/org_1/validacao", { acao: "VALIDAR" }, "decidirValidacao"],
  ["POST", operar, "/org_1/operacao", { acao: "INATIVAR" }, "alterarOperacao"],
  ["GET", listarVinculos, "/org_1/vinculos", undefined, "pessoaOrganizacao"],
  ["POST", criarVinculo, "/org_1/vinculos", { pessoaId: "p_1" }, "criarVinculo"],
  ["PATCH", editarVinculo, "/org_1/vinculos/vin_1", { funcao: "Gestão" }, "editarFuncaoVinculo"],
  ["POST", ativar, "/org_1/vinculos/vin_1/ativar", {}, "ativarVinculo"],
  ["POST", encerrar, "/org_1/vinculos/vin_1/encerrar", {}, "encerrarVinculo"],
  ["PUT", principal, "/org_1/principal", { vinculoId: "vin_1" }, "definirPrincipal"],
];

beforeEach(() => {
  vi.clearAllMocks();
  process.env.MGU_E72_ADMIN_ORIGINS = "http://localhost:3000";
  mock.acesso.mockResolvedValue(admin());
  mock.respostaNegada.mockImplementation((a) =>
    Response.json({ error: a.motivo || "Acesso negado." }, {
      status: a.status || 403,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    }));
  mock.construir.mockReturnValue(mock.servicos);
  for (const metodo of Object.values(mock.servicos)) metodo.mockResolvedValue({
    id: "org_1", organizacaoId: "org_1", vinculoId: "vin_1",
    nomeFantasia: "Empresa", statusValidacao: "PRELIMINAR",
    statusOperacional: "ATIVA", status: "PENDENTE",
    alterado: true, segredoInterno: "NÃO EXPOR",
  });
  mock.prisma.organizacao.count.mockResolvedValue(1);
  mock.prisma.organizacao.findMany.mockResolvedValue([{ id: "org_1", nomeFantasia: "Empresa", segredoInterno: "NÃO EXPOR" }]);
  mock.prisma.organizacao.findUnique.mockResolvedValue({ id: "org_1", nomeFantasia: "Empresa", segredoInterno: "NÃO EXPOR" });
  mock.prisma.pessoaOrganizacao.count.mockResolvedValue(1);
  mock.prisma.pessoaOrganizacao.findMany.mockResolvedValue([{ id: "vin_1", organizacaoId: "org_1", segredoInterno: "NÃO EXPOR" }]);
});
afterEach(() => { delete process.env.MGU_E72_ADMIN_ORIGINS; });

describe("E7.2 D3: contrato das doze operações HTTP", () => {
  it.each(operacoes)("responde sem cache e exige ADMIN: %s %s", async (metodo, handler, path, body) => {
    const resposta = await handler(rota(metodo, path, body), contexto);
    expect([200, 201]).toContain(resposta.status);
    expect(resposta.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(JSON.stringify(await resposta.json())).not.toContain("NÃO EXPOR");
  });
  it.each(operacoes)("nega usuário sem sessão antes de dados: %s %s", async (metodo, handler, path, body) => {
    mock.acesso.mockResolvedValue({ permitido: false, status: 401, motivo: "Não autorizado." });
    const resposta = await handler(rota(metodo, path, body), contexto);
    expect(resposta.status).toBe(401);
    expect(mock.construir).not.toHaveBeenCalled();
    expect(mock.prisma.organizacao.findMany).not.toHaveBeenCalled();
  });
  it.each(operacoes)("nega PARCEIRO antes de dados: %s %s", async (metodo, handler, path, body) => {
    mock.acesso.mockResolvedValue({ permitido: false, status: 403, motivo: "Acesso restrito." });
    const resposta = await handler(rota(metodo, path, body), contexto);
    expect(resposta.status).toBe(403);
    expect(mock.construir).not.toHaveBeenCalled();
  });
  it.each(operacoes.filter(([metodo]) => metodo !== "GET"))("rejeita origem não autorizada: %s %s", async (metodo, handler, path, body) => {
    const resposta = await handler(rota(metodo, path, body, { origin: "https://invasor.example" }), contexto);
    expect(resposta.status).toBe(403);
    expect((await resposta.json()).code).toBe("ORIGEM_NAO_AUTORIZADA");
    expect(mock.construir).not.toHaveBeenCalled();
  });
  it("exige configuração explícita, protege contra cross-site e credenciais na URL", () => {
    const req = rota("POST", "", {});
    expect(origemMutacaoPermitida(req)).toBe(true);
    delete process.env.MGU_E72_ADMIN_ORIGINS;
    expect(origemMutacaoPermitida(req)).toBe(false);
    process.env.MGU_E72_ADMIN_ORIGINS = "http://localhost:3000";
    expect(origemMutacaoPermitida(rota("POST", "", {}, { "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(origemMutacaoPermitida(rota("POST", "", {}, { origin: "null" }))).toBe(false);
  });
  it("retorna 400 para paginação inválida e parâmetros extras", async () => {
    for (const query of ["?page=0", "?pageSize=101", "?page=2abc", "?page=1&page=2", "?extra=1"]) {
      const res = await listar(new Request(BASE + query), contexto);
      expect(res.status).toBe(400);
    }
    expect(mock.prisma.organizacao.findMany).not.toHaveBeenCalled();
  });
  it("filtra e pagina sem devolver colunas internas", async () => {
    const res = await listar(new Request(BASE + "?page=2&pageSize=3&statusOperacional=ATIVA&q=ferro"), contexto);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pagination).toEqual({ page: 2, pageSize: 3, total: 1, totalPages: 1 });
    expect(mock.prisma.organizacao.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 3, take: 3,
      where: expect.objectContaining({ statusOperacional: "ATIVA" }),
    }));
    expect(JSON.stringify(json)).not.toContain("segredoInterno");
  });
  it("recusa JSON inválido e corpo grande antes de serviços", async () => {
    const req = new Request(BASE, { method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: "{invalido",
    });
    expect((await criar(req, contexto)).status).toBe(400);
    const grande = rota("POST", "", { nomeFantasia: "a".repeat(17000) });
    expect((await criar(grande, contexto)).status).toBe(400);
    expect(mock.servicos.criar).not.toHaveBeenCalled();
  });
  it("nega mudar estado com body não vazio", async () => {
    const res = await ativar(rota("POST", "/org_1/vinculos/vin_1/ativar", { status: "ATIVO" }), contexto);
    expect(res.status).toBe(400);
    expect(mock.servicos.ativarVinculo).not.toHaveBeenCalled();
  });
  it("retorna 404 para organização inexistente e não busca vínculos", async () => {
    mock.prisma.organizacao.findUnique.mockResolvedValue(null);
    const res = await listarVinculos(new Request(BASE + "/org_1/vinculos"), contexto);
    expect(res.status).toBe(404);
    expect(mock.prisma.pessoaOrganizacao.findMany).not.toHaveBeenCalled();
  });
  it("não expõe mensagens internas de erro", async () => {
    mock.prisma.organizacao.count.mockRejectedValue(new Error("senha Neon segredo teste"));
    const res = await listar(new Request(BASE), contexto);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Erro interno.", code: "ERRO_INTERNO" });
  });
});

describe("E7.2 D3: rodada complementar de segurança", () => {
  const confirmarSemBanco = () => {
    expect(mock.construir).not.toHaveBeenCalled();
    expect(mock.prisma.organizacao.count).not.toHaveBeenCalled();
    expect(mock.prisma.organizacao.findUnique).not.toHaveBeenCalled();
    expect(mock.prisma.pessoaOrganizacao.count).not.toHaveBeenCalled();
  };

  it.each([
    ["ALUNO", { role: "ALUNO" }],
    ["PARCEIRO", { role: "PARCEIRO" }],
    ["conta inativa", { ativo: false }],
    ["senha pendente", { mustChangePassword: true }],
    ["usuário canônico ausente", { usuarioId: "" }],
    ["identidade inválida", { usuarioId: " invalido " }],
  ])("nega %s mesmo quando receber permitido=true", async (_nome, campos) => {
    mock.acesso.mockResolvedValue({
      ...admin(), conta: { ...admin().conta, ...campos },
    });
    const res = await listar(new Request(BASE), contexto);
    expect(res.status).toBe(403);
    expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    confirmarSemBanco();
  });

  it.each([401, 403])("respeita revogação de acesso (%s) antes de escrita", async (status) => {
    mock.acesso.mockResolvedValue({ permitido: false, status, motivo: "Revogado." });
    const res = await criar(rota("POST", "", { nomeFantasia: "Empresa" }), contexto);
    expect(res.status).toBe(status);
    confirmarSemBanco();
  });

  it.each([
    ["sem Origin", { origin: "" }],
    ["Origin nulo", { origin: "null" }],
    ["Origin externo", { origin: "https://invasor.example" }],
    ["Sec-Fetch-Site cross-site", { "sec-fetch-site": "cross-site" }],
    ["Sec-Fetch-Site same-site", { "sec-fetch-site": "same-site" }],
    ["Sec-Fetch-Site inválido", { "sec-fetch-site": "estranho" }],
  ])("recusa origem insegura: %s", async (_nome, headers) => {
    const res = await criar(rota("POST", "", { nomeFantasia: "Empresa" }, headers), contexto);
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("ORIGEM_NAO_AUTORIZADA");
    confirmarSemBanco();
  });

  it("permite apenas Origin exata para hosts MGU explicitamente configurados", () => {
    const urls = [
      "https://admin.mentoriagarimpourbano.com.br",
      "https://mentoriagarimpourbano.com.br",
      "https://alunos.mentoriagarimpourbano.com.br",
      "https://ebook.mentoriagarimpourbano.com.br",
    ];
    process.env.MGU_E72_ADMIN_ORIGINS = urls[0];
    for (const url of urls) {
      const req = new Request(url + "/api/admin/organizacoes", {
        method: "POST", headers: { origin: url, "sec-fetch-site": "same-origin" },
        body: "{}",
      });
      expect(origemMutacaoPermitida(req)).toBe(url === urls[0]);
    }
    expect(origemMutacaoPermitida(new Request(urls[0] + "/api/admin/organizacoes", {
      method: "POST", headers: { origin: urls[0], "sec-fetch-site": "same-site" },
      body: "{}",
    }))).toBe(false);
  });

  it.each(["null", "[]", "42", "true", '"texto"', "{invalido"])(
    "rejeita body JSON inválido ou não objeto: %s", async (texto) => {
      const req = new Request(BASE, {
        method: "POST",
        headers: { origin: "http://localhost:3000", "content-type": "application/json" },
        body: texto,
      });
      const res = await criar(req, contexto);
      expect(res.status).toBe(400);
      expect(mock.servicos.criar).not.toHaveBeenCalled();
    },
  );

  it("não aceita tipo de conteúdo diverso de JSON", async () => {
    const req = new Request(BASE, {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "text/plain" },
      body: "{}",
    });
    expect((await criar(req, contexto)).status).toBe(400);
    expect(mock.servicos.criar).not.toHaveBeenCalled();
  });

  it.each([
    ["RECONFIRMACAO_OBRIGATORIA", 409],
    ["CONFIRMACAO_INAPLICAVEL", 400],
    ["NAO_ENCONTRADO", 404],
    ["CNPJ_EM_USO", 409],
    ["TRANSICAO_INVALIDA", 409],
    ["ORGANIZACAO_INATIVA", 409],
  ])("retorna erro de domínio sem vazamento: %s", async (codigo, status) => {
    const { ErroDominioOrganizacao } = await import("../src/lib/servicos-organizacao.js");
    mock.servicos.editar.mockRejectedValueOnce(new ErroDominioOrganizacao(codigo, status));
    const res = await editar(rota("PATCH", "/org_1", { nomeFantasia: "Mudança" }), contexto);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error: codigo, code: codigo });
    expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  });

  it("não converte falha Prisma desconhecida em 409 nem vaza detalhes", async () => {
    mock.servicos.criar.mockRejectedValueOnce({ code: "P1001", message: "Neon indisponível, segredo" });
    const res = await criar(rota("POST", "", { nomeFantasia: "Empresa" }), contexto);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Erro interno.", code: "ERRO_INTERNO" });
  });

  it("não reescreve resultados de no-op de principal", async () => {
    mock.servicos.definirPrincipal.mockResolvedValueOnce({
      organizacaoId: "org_1", vinculoId: "vin_1", alterado: false,
      campoInterno: "não expor",
    });
    const res = await principal(rota("PUT", "/org_1/principal", { vinculoId: "vin_1" }), contexto);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      item: { organizacaoId: "org_1", vinculoId: "vin_1", alterado: false },
    });
  });
});
