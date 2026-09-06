import { describe, expect, it } from "vitest";
import {
  emailFormatoAdminValido,
  emailFormatoValido,
  emailValido,
  imagemUrlValida,
  inteiroLimitado,
  nomeAdminValido,
  normalizarEmail,
  normalizarUf,
  roleAdminValida,
  senhaAdminValida,
  senhaAlunoValida,
  ufValida,
  urlHttpsValida,
  valorMonetarioValido,
} from "../src/lib/validacoes.js";

describe("validações compartilhadas", () => {
  describe("e-mail", () => {
    it("normaliza e-mail quando solicitado explicitamente", () => {
      expect(normalizarEmail(" Teste@Exemplo.COM ")).toBe("teste@exemplo.com");
      expect(normalizarEmail(null)).toBe("");
    });

    it("valida o formato básico de e-mail", () => {
      expect(emailFormatoValido("teste@exemplo.com")).toBe(true);
      expect(emailFormatoValido("teste@@exemplo.com")).toBe(false);
      expect(emailFormatoValido(" teste@exemplo.com ")).toBe(false);
    });

    it("preserva a regra histórica do e-mail administrativo", () => {
      expect(emailFormatoAdminValido("teste@exemplo.com")).toBe(true);
      expect(emailFormatoAdminValido("teste@@exemplo.com")).toBe(true);
      expect(emailFormatoAdminValido("teste exemplo@exemplo.com")).toBe(false);
    });

    it("rejeita erros conhecidos de digitação", () => {
      expect(emailValido("teste@exemplo.com")).toBe(true);
      expect(emailValido("teste@exemplo.con")).toBe(false);
      expect(emailValido("teste@exemplo.com.brr")).toBe(false);
    });
  });

  describe("administrativo", () => {
    it("valida nome administrativo pelo tamanho", () => {
      expect(nomeAdminValido("AB")).toBe(true);
      expect(nomeAdminValido(" A ")).toBe(false);
      expect(nomeAdminValido("A".repeat(120))).toBe(true);
      expect(nomeAdminValido("A".repeat(121))).toBe(false);
    });

    it("valida senha administrativa", () => {
      expect(senhaAdminValida("A".repeat(11))).toBe(false);
      expect(senhaAdminValida("A".repeat(12))).toBe(true);
    });

    it("valida roles administrativas permitidas", () => {
      expect(roleAdminValida("ADMIN")).toBe(true);
      expect(roleAdminValida("PARCEIRO")).toBe(true);
      expect(roleAdminValida("FORNECEDOR")).toBe(true);
      expect(roleAdminValida("ALUNO")).toBe(false);
    });
  });

  describe("aluno", () => {
    it("valida senha entre 8 e 128 caracteres", () => {
      expect(senhaAlunoValida("A".repeat(7))).toBe(false);
      expect(senhaAlunoValida("A".repeat(8))).toBe(true);
      expect(senhaAlunoValida("A".repeat(128))).toBe(true);
      expect(senhaAlunoValida("A".repeat(129))).toBe(false);
    });
  });

  describe("paginação", () => {
    it("converte, limita e aplica valor padrão", () => {
      expect(inteiroLimitado("25", 10, 1, 100)).toBe(25);
      expect(inteiroLimitado("7abc", 10, 1, 100)).toBe(7);
      expect(inteiroLimitado("-5", 10, 1, 100)).toBe(1);
      expect(inteiroLimitado("500", 10, 1, 100)).toBe(100);
      expect(inteiroLimitado("abc", 10, 1, 100)).toBe(10);
    });
  });

  describe("valor monetário", () => {
    it("aceita zero e valores numéricos não negativos", () => {
      expect(valorMonetarioValido(0)).toBe(true);
      expect(valorMonetarioValido(10.5)).toBe(true);
      expect(valorMonetarioValido("10.5")).toBe(true);
    });

    it("rejeita valores inválidos", () => {
      expect(valorMonetarioValido(-1)).toBe(false);
      expect(valorMonetarioValido("")).toBe(false);
      expect(valorMonetarioValido("   ")).toBe(false);
      expect(valorMonetarioValido("abc")).toBe(false);
      expect(valorMonetarioValido(null)).toBe(false);
    });
  });

  describe("imagem", () => {
    it("aceita formatos de imagem já suportados pelo sistema", () => {
      expect(imagemUrlValida("")).toBe(true);
      expect(imagemUrlValida(null)).toBe(true);
      expect(imagemUrlValida("/imagens/teste.jpg")).toBe(true);
      expect(imagemUrlValida("public/imagens/teste.jpg")).toBe(true);
      expect(imagemUrlValida("public\\imagens\\teste.jpg")).toBe(true);
      expect(imagemUrlValida("https://exemplo.com/teste.jpg")).toBe(true);
      expect(imagemUrlValida("http://exemplo.com/teste.jpg")).toBe(true);
    });

    it("rejeita texto que não representa formato aceito", () => {
      expect(imagemUrlValida("url-invalida")).toBe(false);
    });
  });

  describe("UF", () => {
    it("normaliza UF", () => {
      expect(normalizarUf(" sp ")).toBe("SP");
      expect(normalizarUf(null)).toBe("");
    });

    it("valida as UFs brasileiras e mantém o campo opcional", () => {
      expect(ufValida("SP")).toBe(true);
      expect(ufValida(" sp ")).toBe(true);
      expect(ufValida("")).toBe(true);
      expect(ufValida(null)).toBe(true);
      expect(ufValida("XX")).toBe(false);
      expect(ufValida("São Paulo")).toBe(false);
    });
  });

  describe("URL HTTPS", () => {
    it("preserva a validação HTTPS histórica do perfil", () => {
      expect(urlHttpsValida("https://exemplo.com/foto.jpg")).toBe(true);
      expect(urlHttpsValida("HTTPS://exemplo.com/foto.jpg")).toBe(true);
      expect(urlHttpsValida("https://")).toBe(true);
      expect(urlHttpsValida("http://exemplo.com/foto.jpg")).toBe(false);
    });
  });
});
