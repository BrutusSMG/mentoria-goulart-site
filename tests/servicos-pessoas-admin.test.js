import { describe, expect, it, vi } from "vitest";
import {
  criarServicosPessoasAdmin, ErroPessoaAdmin,
  traduzirErroPessoa, validarBuscaPessoas, validarCriacaoPessoa,
} from "../src/lib/servicos-pessoas-admin.js";

const admin = { permitido: true, ehAdmin: true,
  conta: { role: "ADMIN", ativo: true, usuarioId: "usuario_admin", mustChangePassword: false } };

describe("E7.3: validação e identidade", () => {
  it("normaliza e-mail e preserva identidade por ID", () => {
    expect(validarCriacaoPessoa({
      nome: " Maria ", emailPrincipal: " MARIA@EXEMPLO.COM ", telefonePrincipal: " 0011999 ",
    })).toEqual({ nome: "Maria", emailPrincipal: "maria@exemplo.com", telefonePrincipal: "0011999" });
  });
  it("rejeita entrada incompleta, e-mail inválido e campos privilegiados", () => {
    for (const dados of [
      { nome: "Maria" },
      { nome: "M", emailPrincipal: "m@exemplo.com" },
      { nome: "Maria", emailPrincipal: "inválido" },
      { nome: "Maria", emailPrincipal: "m@exemplo.com", criadoPorUsuarioId: "intruso" },
      { nome: "Maria", emailPrincipal: "m@exemplo.com", telefonePrincipal: 123 },
    ]) expect(() => validarCriacaoPessoa(dados)).toThrow(ErroPessoaAdmin);
  });
  it("não permite listagem sem busca nem parâmetros duplicados", () => {
    for (const query of ["", "q=a", "q=Maria&page=0", "q=Maria&pageSize=51", "q=Maria&q=Joao", "q=Maria&extra=1"]) {
      expect(() => validarBuscaPessoas(new URLSearchParams(query))).toThrow(ErroPessoaAdmin);
    }
  });
  it("traduz somente colisão conhecida de e-mail", () => {
    expect(traduzirErroPessoa({ code: "P2002", meta: { target: ["emailPrincipal"] } }).codigo).toBe("EMAIL_EM_USO");
    const erro = { code: "P2002", meta: { target: ["outroCampo"] } };
    expect(traduzirErroPessoa(erro)).toBe(erro);
  });
  it("nega acesso não ADMIN", () => {
    expect(() => criarServicosPessoasAdmin({ prisma: {}, acesso: {
      ...admin, ehAdmin: false, conta: { ...admin.conta, role: "PARCEIRO" },
    } })).toThrow(ErroPessoaAdmin);
  });
  it("cria Pessoa com autoria do Usuario autenticado e sem criar papéis", async () => {
    const criada = { id: "pessoa_1", nome: "Maria", emailPrincipal: "maria@exemplo.com", ativo: true };
    const tx = { pessoa: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(criada),
    } };
    const prisma = { $transaction: vi.fn((fn) => fn(tx)) };
    const servico = criarServicosPessoasAdmin({ prisma, acesso: admin });
    expect(await servico.criar({ nome: "Maria", emailPrincipal: "MARIA@EXEMPLO.COM" })).toEqual(criada);
    expect(tx.pessoa.create).toHaveBeenCalledWith({
      data: { nome: "Maria", emailPrincipal: "maria@exemplo.com",
        telefonePrincipal: null, criadoPorUsuarioId: "usuario_admin" },
      select: { id: true, nome: true, emailPrincipal: true, ativo: true },
    });
    expect(Object.keys(tx)).toEqual(["pessoa"]);
  });
  it("rejeita e-mail existente sem chamar create", async () => {
    const tx = { pessoa: {
      findMany: vi.fn().mockResolvedValue([{ id: "existente" }]),
      create: vi.fn(),
    } };
    const servico = criarServicosPessoasAdmin({
      prisma: { $transaction: (fn) => fn(tx) }, acesso: admin,
    });
    await expect(servico.criar({ nome: "Maria", emailPrincipal: "maria@exemplo.com" }))
      .rejects.toMatchObject({ codigo: "EMAIL_EM_USO", status: 409 });
    expect(tx.pessoa.create).not.toHaveBeenCalled();
  });
  it("busca Pessoa sem exigir Lead", async () => {
    const prisma = { pessoa: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        { id: "p1", nome: "Maria", emailPrincipal: "maria@exemplo.com", ativo: true },
      ]),
    } };
    const servico = criarServicosPessoasAdmin({ prisma, acesso: admin });
    const resultado = await servico.buscar(new URLSearchParams("q=maria"));
    expect(resultado.pagination.total).toBe(1);
    expect(prisma.pessoa.findMany.mock.calls[0][0].where.OR).toHaveLength(2);
  });
});
