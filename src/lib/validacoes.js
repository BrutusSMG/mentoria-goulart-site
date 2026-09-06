// src/lib/validacoes.js

export const ROLES_ADMIN = Object.freeze([
  "ADMIN",
  "PARCEIRO",
  "FORNECEDOR",
]);

export const SENHA_ADMIN_MIN = 12;

export const SENHA_ALUNO_MIN = 8;
export const SENHA_ALUNO_MAX = 128;

export const NOME_ADMIN_MIN = 2;
export const NOME_ADMIN_MAX = 120;

export const UFS_BRASIL = Object.freeze([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarEmail(valor) {
  return typeof valor === "string"
    ? valor.trim().toLowerCase()
    : "";
}

export function emailFormatoValido(valor) {
  return (
    typeof valor === "string" &&
    EMAIL_REGEX.test(valor)
  );
}

export function emailFormatoAdminValido(valor) {
  return (
    typeof valor === "string" &&
    /^\S+@\S+\.\S+$/.test(valor)
  );
}

export function emailValido(valor) {
  return (
    emailFormatoValido(valor) &&
    !valor.endsWith(".con") &&
    !valor.endsWith(".com.brr")
  );
}

export function nomeAdminValido(valor) {
  const nome = typeof valor === "string"
    ? valor.trim()
    : "";

  return (
    nome.length >= NOME_ADMIN_MIN &&
    nome.length <= NOME_ADMIN_MAX
  );
}

export function senhaAdminValida(senha) {
  return (
    typeof senha === "string" &&
    senha.length >= SENHA_ADMIN_MIN
  );
}

export function senhaAlunoValida(senha) {
  return (
    typeof senha === "string" &&
    senha.length >= SENHA_ALUNO_MIN &&
    senha.length <= SENHA_ALUNO_MAX
  );
}

export function roleAdminValida(role) {
  return ROLES_ADMIN.includes(role);
}

export function inteiroLimitado(valor, padrao, minimo, maximo) {
  const numero = Number.parseInt(valor, 10);

  if (Number.isNaN(numero)) {
    return padrao;
  }

  return Math.min(
    Math.max(numero, minimo),
    maximo,
  );
}

export function valorMonetarioValido(valor) {
  if (typeof valor !== "number" && typeof valor !== "string") {
    return false;
  }

  if (typeof valor === "string" && !valor.trim()) {
    return false;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) && numero >= 0;
}

export function imagemUrlValida(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return true;
  }

  if (typeof valor !== "string") {
    return false;
  }

  const texto = valor.trim().replaceAll("\\", "/");

  if (!texto) {
    return true;
  }

  if (texto.startsWith("/")) {
    return true;
  }

  if (texto.startsWith("public/")) {
    return true;
  }

  try {
    const url = new URL(texto);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizarUf(valor) {
  return typeof valor === "string"
    ? valor.trim().toUpperCase()
    : "";
}

export function ufValida(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return true;
  }

  const uf = normalizarUf(valor);

  return UFS_BRASIL.includes(uf);
}

export function urlHttpsValida(valor) {
  return (
    typeof valor === "string" &&
    /^https:\/\//i.test(valor)
  );
}
