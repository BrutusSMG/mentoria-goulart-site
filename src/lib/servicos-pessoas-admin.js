import { emailFormatoValido, normalizarEmail } from "./validacoes.js";

export class ErroPessoaAdmin extends Error {
  constructor(codigo, status = 400) {
    super(codigo);
    this.codigo = codigo;
    this.status = status;
  }
}

const falhar = (codigo, status = 400) => { throw new ErroPessoaAdmin(codigo, status); };
const SELECT = Object.freeze({ id: true, nome: true, emailPrincipal: true, ativo: true });

function verificarAtor(acesso) {
  const id = acesso?.conta?.usuarioId;
  if (acesso?.permitido !== true || acesso?.ehAdmin !== true ||
    acesso?.conta?.role !== "ADMIN" || acesso?.conta?.ativo !== true ||
    acesso?.conta?.mustChangePassword || typeof id !== "string" ||
    !/^[A-Za-z0-9_-]{1,128}$/.test(id)) falhar("ACESSO_NEGADO", 403);
  return id;
}

export function validarCriacaoPessoa(entrada) {
  if (!entrada || typeof entrada !== "object" || Array.isArray(entrada) ||
    Object.keys(entrada).some((chave) =>
      !["nome", "emailPrincipal", "telefonePrincipal"].includes(chave)) ||
    typeof entrada.nome !== "string" ||
    typeof entrada.emailPrincipal !== "string") falhar("ENTRADA_INVALIDA");
  const nome = entrada.nome.trim();
  const emailPrincipal = normalizarEmail(entrada.emailPrincipal);
  const telefone = entrada.telefonePrincipal;
  if (nome.length < 2 || nome.length > 200 ||
    emailPrincipal.length > 254 || !emailFormatoValido(emailPrincipal) ||
    (telefone !== undefined && telefone !== null && typeof telefone !== "string")) {
    falhar("ENTRADA_INVALIDA");
  }
  const telefonePrincipal = typeof telefone === "string" ? telefone.trim() || null : null;
  if (telefonePrincipal && telefonePrincipal.length > 32) falhar("ENTRADA_INVALIDA");
  return { nome, emailPrincipal, telefonePrincipal };
}

export function validarBuscaPessoas(params) {
  const permitidos = new Set(["q", "page", "pageSize"]);
  for (const chave of params.keys()) {
    if (!permitidos.has(chave) || params.getAll(chave).length !== 1) falhar("ENTRADA_INVALIDA");
  }
  const q = params.get("q")?.trim() || "";
  const pageRaw = params.get("page") ?? "1";
  const sizeRaw = params.get("pageSize") ?? "20";
  if (q.length < 2 || q.length > 120 ||
    !/^[1-9]\d{0,5}$/.test(pageRaw) ||
    !/^[1-9]\d{0,2}$/.test(sizeRaw)) falhar("ENTRADA_INVALIDA");
  const page = Number(pageRaw);
  const pageSize = Number(sizeRaw);
  if (pageSize > 50 || !Number.isSafeInteger((page - 1) * pageSize)) falhar("ENTRADA_INVALIDA");
  return { q, page, pageSize };
}

export function traduzirErroPessoa(erro) {
  if (erro instanceof ErroPessoaAdmin) return erro;
  if (erro?.code !== "P2002" && erro?.code !== "23505") return erro;
  const alvo = erro?.meta?.target;
  const nomes = [
    ...(Array.isArray(alvo) ? alvo : typeof alvo === "string" ? [alvo] : []),
    erro?.meta?.constraint, erro?.constraint,
  ].filter((item) => typeof item === "string");
  if (nomes.some((nome) => [
    "emailPrincipal", "Pessoa_emailPrincipal_key",
    "Pessoa_emailPrincipal_normalizado_uidx",
  ].includes(nome))) return new ErroPessoaAdmin("EMAIL_EM_USO", 409);
  return erro;
}

export function criarServicosPessoasAdmin({ prisma, acesso }) {
  const usuarioId = verificarAtor(acesso);
  return Object.freeze({
    async buscar(params) {
      const { q, page, pageSize } = validarBuscaPessoas(params);
      const where = { OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { emailPrincipal: { contains: q, mode: "insensitive" } },
      ] };
      const [total, items] = await Promise.all([
        prisma.pessoa.count({ where }),
        prisma.pessoa.findMany({
          where, select: SELECT,
          orderBy: [{ nome: "asc" }, { id: "asc" }],
          skip: (page - 1) * pageSize, take: pageSize,
        }),
      ]);
      return { items, pagination: {
        page, pageSize, total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      } };
    },
    async criar(entrada) {
      const dados = validarCriacaoPessoa(entrada);
      try {
        return await prisma.$transaction(async (tx) => {
          const existentes = await tx.pessoa.findMany({
            where: { emailPrincipal: { equals: dados.emailPrincipal, mode: "insensitive" } },
            select: { id: true }, take: 2,
          });
          if (existentes.length) falhar("EMAIL_EM_USO", 409);
          return tx.pessoa.create({
            data: { ...dados, criadoPorUsuarioId: usuarioId },
            select: SELECT,
          });
        });
      } catch (erro) {
        throw traduzirErroPessoa(erro);
      }
    },
  });
}
