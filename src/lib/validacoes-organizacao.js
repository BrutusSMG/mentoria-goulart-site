// E7.2 — validadores puros. Não acessam sessão, Prisma, rede ou banco.
// Não concedem validação cadastral ou habilitação comercial.

export const LIMITES_ORGANIZACAO = Object.freeze({
  nomeFantasia: 200,
  razaoSocial: 200,
  email: 254,
  telefone: 32,
  site: 2048,
  funcao: 200,
  motivoRejeicao: 2000,
  busca: 120,
});

export const CAMPOS_CADASTRAIS_ORGANIZACAO = Object.freeze([
  "nomeFantasia", "razaoSocial", "cnpj", "email", "telefone", "site",
]);

const CNPJ_CANONICO = /^[0-9A-Z]{12}[0-9]{2}$/;
const CNPJ_MASCARADO = /^[0-9A-Z]{2}\.[0-9A-Z]{3}\.[0-9A-Z]{3}\/[0-9A-Z]{4}-[0-9]{2}$/;
const EMAIL_SINTATICO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAMPOS = new Set(CAMPOS_CADASTRAIS_ORGANIZACAO);

export function normalizarCnpjOrganizacao(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor !== "string") throw new TypeError("CNPJ deve ser texto ou nulo.");

  const texto = valor.trim().toUpperCase();
  if (!texto) return null;

  // Somente a máscara canônica de apresentação é removida. Não limpar
  // caracteres arbitrários, para não transformar uma entrada inválida em válida.
  return CNPJ_MASCARADO.test(texto)
    ? texto.replace(/[.\/-]/g, "")
    : texto;
}

function digitoVerificador(caracteres) {
  let soma = 0;
  for (let i = caracteres.length - 1, pos = 0; i >= 0; i -= 1, pos += 1) {
    soma += (caracteres.charCodeAt(i) - 48) * (2 + (pos % 8));
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cnpjOrganizacaoValido(valor) {
  if (valor !== null && typeof valor !== "string") return false;
  const cnpj = normalizarCnpjOrganizacao(valor);
  if (cnpj === null || !CNPJ_CANONICO.test(cnpj)) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const primeiro = digitoVerificador(cnpj.slice(0, 12));
  const segundo = digitoVerificador(cnpj.slice(0, 12) + primeiro);
  return cnpj.slice(12) === String(primeiro) + String(segundo);
}

export function nomesOrganizacaoValidos(dados) {
  return [dados?.nomeFantasia, dados?.razaoSocial].some(
    (valor) => typeof valor === "string" && valor.trim().length > 0,
  );
}

function urlHttpsValida(valor) {
  if (!/^https:\/\//i.test(valor) || /[\u0000-\u001f\u007f]/.test(valor)) return false;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && Boolean(url.hostname)
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

function adicionarErro(erros, campo, codigo = "ENTRADA_INVALIDA") {
  erros.push({ campo, codigo });
}

// A verificação de nomes após PATCH deve usar o estado FINAL mesclado sob lock:
// nomesOrganizacaoValidos({ ...registroAtual, ...resultado.dados }).
// A reconfirmação da opção B depende igualmente do estado atual sob lock.
export function validarEntradaOrganizacao(entrada, { parcial = false } = {}) {
  if (entrada === null || typeof entrada !== "object" || Array.isArray(entrada)) {
    return { valido: false, codigo: "ENTRADA_INVALIDA", erros: [{ campo: "body", codigo: "ENTRADA_INVALIDA" }] };
  }

  const dados = {};
  const erros = [];
  let reconfirmarValidacao;
  let camposPresentes = 0;

  for (const campo of Object.keys(entrada)) {
    if (parcial && campo === "reconfirmarValidacao") {
      if (typeof entrada[campo] !== "boolean") adicionarErro(erros, campo);
      else reconfirmarValidacao = entrada[campo];
      continue;
    }

    if (!CAMPOS.has(campo)) {
      adicionarErro(erros, campo);
      continue;
    }

    camposPresentes += 1;
    const valor = entrada[campo];
    if (valor !== null && typeof valor !== "string") {
      adicionarErro(erros, campo);
      continue;
    }

    const texto = typeof valor === "string" ? valor.trim() : "";
    if (!texto) {
      dados[campo] = null;
      continue;
    }

    if (campo === "cnpj") {
      if (!cnpjOrganizacaoValido(texto)) adicionarErro(erros, campo, "CNPJ_INVALIDO");
      else dados.cnpj = normalizarCnpjOrganizacao(texto);
      continue;
    }

    if (texto.length > LIMITES_ORGANIZACAO[campo]) {
      adicionarErro(erros, campo);
      continue;
    }

    if (campo === "email") {
      const email = texto.toLowerCase();
      if (!EMAIL_SINTATICO.test(email)) adicionarErro(erros, campo);
      else dados.email = email;
    } else if (campo === "site") {
      if (!urlHttpsValida(texto)) adicionarErro(erros, campo);
      else dados.site = texto;
    } else {
      dados[campo] = texto;
    }
  }

  if (parcial && camposPresentes === 0) adicionarErro(erros, "body");
  if (!parcial && !nomesOrganizacaoValidos(dados)) {
    adicionarErro(erros, "nomeFantasia|razaoSocial", "NOME_OBRIGATORIO");
  }

  if (erros.length) {
    const principal = erros.find((erro) => erro.codigo === "CNPJ_INVALIDO")
      || erros.find((erro) => erro.codigo === "NOME_OBRIGATORIO")
      || erros[0];
    return { valido: false, codigo: principal.codigo, erros };
  }

  return {
    valido: true,
    dados,
    ...(reconfirmarValidacao !== undefined ? { reconfirmarValidacao } : {}),
  };
}

// Paginação estrita: não truncar "2.5", "3abc", negativos ou números inseguros.
export function validarPaginacaoOrganizacao(parametros) {
  const ler = (chave) => parametros instanceof URLSearchParams
    ? parametros.get(chave) : parametros?.[chave];

  function inteiro(chave, padrao, maximo) {
    const bruto = ler(chave);
    if (bruto === undefined || bruto === null) return padrao;
    if (typeof bruto !== "string" && typeof bruto !== "number") return null;
    const texto = String(bruto);
    if (!/^[1-9]\d*$/.test(texto)) return null;
    const numero = Number(texto);
    if (!Number.isSafeInteger(numero) || numero > maximo) return null;
    return numero;
  }

  const page = inteiro("page", 1, Number.MAX_SAFE_INTEGER);
  const pageSize = inteiro("pageSize", 20, 100);
  const buscaBruta = ler("q");
  const buscaValida = buscaBruta == null || typeof buscaBruta === "string";
  const q = buscaValida && buscaBruta != null ? buscaBruta.trim() : null;

  if (page === null || pageSize === null || !buscaValida
      || (q !== null && q.length > LIMITES_ORGANIZACAO.busca)) {
    return { valido: false, codigo: "ENTRADA_INVALIDA" };
  }
  return { valido: true, page, pageSize, q: q || null };
}
