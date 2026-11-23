import { describe, expect, it } from "vitest";
import {
  CAMPOS_CADASTRAIS_ORGANIZACAO,
  LIMITES_ORGANIZACAO,
  cnpjOrganizacaoValido,
  nomesOrganizacaoValidos,
  normalizarCnpjOrganizacao,
  validarEntradaOrganizacao,
  validarPaginacaoOrganizacao,
} from "../src/lib/validacoes-organizacao.js";

// Os dez vetores são os mesmos do ensaio CNPJ offline da E7.2 (17/10/2026).
const vetoresCnpj = [
  ["oficial alfanumérico", "12.ABC.345/01DE-35", true, "12ABC34501DE35"],
  ["numérico válido", "11.222.333/0001-81", true, "11222333000181"],
  ["zeros iniciais", "04.252.011/0001-10", true, "04252011000110"],
  ["letras minúsculas", "12.abc.345/01de-35", true, "12ABC34501DE35"],
  ["DV alfanumérico incorreto", "12ABC34501DE00", false, "12ABC34501DE00"],
  ["DV numérico incorreto", "11222333000180", false, "11222333000180"],
  ["todos zeros", "00000000000000", false, "00000000000000"],
  ["caractere inválido", "12ABC34501D@35", false, "12ABC34501D@35"],
  ["tamanho inválido", "123456", false, "123456"],
  ["nulo", null, false, null],
];

describe("CNPJ de organizações E7.2", () => {
  it.each(vetoresCnpj)("valida vetor %s", (_nome, entrada, valido, normalizado) => {
    expect(cnpjOrganizacaoValido(entrada)).toBe(valido);
    expect(normalizarCnpjOrganizacao(entrada)).toBe(normalizado);
  });

  it("não aceita caracteres descartados silenciosamente nem tipos numéricos", () => {
    expect(cnpjOrganizacaoValido("12 ABC 345 01DE 35")).toBe(false);
    expect(cnpjOrganizacaoValido("12.ABC.345/01DE_35")).toBe(false);
    expect(cnpjOrganizacaoValido(11222333000181)).toBe(false);
    expect(() => normalizarCnpjOrganizacao(11222333000181)).toThrow(TypeError);
  });
});

describe("cadastro e edição de organizações E7.2", () => {
  it("exige nome e aceita CNPJ ausente no cadastro preliminar", () => {
    const ok = validarEntradaOrganizacao({ nomeFantasia: "  Garimpo  " });
    expect(ok).toEqual({ valido: true, dados: { nomeFantasia: "Garimpo" } });
    expect(validarEntradaOrganizacao({ email: "a@b.com" }).codigo).toBe("NOME_OBRIGATORIO");
    expect(validarEntradaOrganizacao({ nomeFantasia: "  ", razaoSocial: null }).codigo).toBe("NOME_OBRIGATORIO");
  });

  it("normaliza texto, e-mail, CNPJ e opcionais em branco", () => {
    const resultado = validarEntradaOrganizacao({
      razaoSocial: "  Empresa  ",
      cnpj: "12.abc.345/01de-35",
      email: "  CONTATO@EXEMPLO.COM.BR  ",
      telefone: "  0011-3333 ",
      site: "   https://exemplo.com.br/  ",
      nomeFantasia: "  ",
    });
    expect(resultado).toEqual({ valido: true, dados: {
      razaoSocial: "Empresa", cnpj: "12ABC34501DE35",
      email: "contato@exemplo.com.br", telefone: "0011-3333",
      site: "https://exemplo.com.br/", nomeFantasia: null,
    } });
  });

  it("recusa campos extras, valores com tipo incorreto e marcador na criação", () => {
    expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", statusValidacao: "VALIDADA" }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", pais: "BR" }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", reconfirmarValidacao: true }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ nomeFantasia: 123 }).valido).toBe(false);
    expect(validarEntradaOrganizacao([]).valido).toBe(false);
    expect(validarEntradaOrganizacao(null).valido).toBe(false);
  });

  it("rejeita CNPJ inválido e preserva zeros à esquerda", () => {
    expect(validarEntradaOrganizacao({ nomeFantasia: "Teste", cnpj: "04252011000110" }).dados.cnpj).toBe("04252011000110");
    expect(validarEntradaOrganizacao({ nomeFantasia: "Teste", cnpj: "11222333000180" }).codigo).toBe("CNPJ_INVALIDO");
  });

  it("impõe limites e valida e-mail e URL HTTPS sem credenciais", () => {
    expect(validarEntradaOrganizacao({ nomeFantasia: "a".repeat(201) }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", telefone: "a".repeat(33) }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", email: "sem-arroba" }).valido).toBe(false);
    for (const site of ["http://exemplo.com", "https://user:senha@exemplo.com", "https://", "https://exemplo.com/\nnovo"]) {
      expect(validarEntradaOrganizacao({ nomeFantasia: "Empresa", site }).valido).toBe(false);
    }
    expect(LIMITES_ORGANIZACAO.email).toBe(254);
    expect(CAMPOS_CADASTRAIS_ORGANIZACAO).toHaveLength(6);
  });

  it("no PATCH preserva campos omitidos e aceita marcador booleano separado", () => {
    const resultado = validarEntradaOrganizacao({ razaoSocial: "  Nova razão ", reconfirmarValidacao: true }, { parcial: true });
    expect(resultado).toEqual({ valido: true, dados: { razaoSocial: "Nova razão" }, reconfirmarValidacao: true });
    expect(validarEntradaOrganizacao({ email: "  " }, { parcial: true }).dados).toEqual({ email: null });
    expect(validarEntradaOrganizacao({ email: "ok@exemplo.com", reconfirmarValidacao: "true" }, { parcial: true }).valido).toBe(false);
    expect(validarEntradaOrganizacao({ reconfirmarValidacao: true }, { parcial: true }).valido).toBe(false);
    expect(validarEntradaOrganizacao({}, { parcial: true }).valido).toBe(false);
  });

  it("permite conferir nomes no estado final, não apenas no PATCH", () => {
    const atual = { nomeFantasia: "Loja", razaoSocial: null };
    const edicao = validarEntradaOrganizacao({ nomeFantasia: null }, { parcial: true });
    expect(edicao.valido).toBe(true);
    expect(nomesOrganizacaoValidos({ ...atual, ...edicao.dados })).toBe(false);
    expect(nomesOrganizacaoValidos({ razaoSocial: "Razão" })).toBe(true);
  });
});

describe("paginação e busca E7.2", () => {
  it("usa defaults e aceita consulta válida", () => {
    expect(validarPaginacaoOrganizacao(new URLSearchParams())).toEqual({ valido: true, page: 1, pageSize: 20, q: null });
    expect(validarPaginacaoOrganizacao(new URLSearchParams("page=2&pageSize=100&q=%20metal%20"))).toEqual({ valido: true, page: 2, pageSize: 100, q: "metal" });
  });

  it("rejeita paginação ambígua e busca muito longa", () => {
    for (const params of [
      { page: "0" }, { page: "2abc" }, { page: "2.5" },
      { page: "9007199254740992" }, { pageSize: "101" },
      { pageSize: "" }, { pageSize: "-1" }, { q: "x".repeat(121) },
    ]) {
      expect(validarPaginacaoOrganizacao(params).valido).toBe(false);
    }
  });
});
