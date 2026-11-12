// E7.2 / D3 — camada HTTP ADMIN. Sem migrações, sem consultas externas.
// Não está pronta para deploy: exige revisão de origens reais, proteção CSRF,
// integração Prisma E7.2, transações reais e testes de segurança end-to-end.
import { obterAcessoAdmin, prisma, respostaAcessoNegado } from "@/lib/admin-permissoes";
import {
  criarServicosOrganizacao,
  ErroDominioOrganizacao,
  traduzirErroUnicidadeOrganizacao,
} from "@/lib/servicos-organizacao";
import { validarPaginacaoOrganizacao } from "@/lib/validacoes-organizacao";

const SEM_CACHE = "private, no-store, max-age=0";
const MAX_CORPO_BYTES = 16 * 1024; // limite defensivo provisório, revisar antes de HML
const ID = /^[A-Za-z0-9_-]{1,128}$/;
const STATUS_VALIDACAO = new Set(["PRELIMINAR", "VALIDADA", "REJEITADA"]);
const STATUS_OPERACIONAL = new Set(["ATIVA", "INATIVA"]);
const STATUS_VINCULO = new Set(["PENDENTE", "ATIVO", "ENCERRADO"]);

const CAMPOS_ORGANIZACAO = Object.freeze([
  "id", "pais", "nomeFantasia", "razaoSocial", "cnpj", "email", "telefone", "site",
  "statusValidacao", "statusOperacional", "motivoUltimaRejeicao", "createdAt", "updatedAt",
  "criadoPorUsuarioId", "alteradoPorUsuarioId", "validacaoDecididaPorUsuarioId",
  "validacaoDecididaEm",
]);
const CAMPOS_VINCULO = Object.freeze([
  "id", "pessoaId", "organizacaoId", "funcao", "status", "principal", "inicioEm",
  "fimEm", "createdAt", "updatedAt", "criadoPorUsuarioId", "alteradoPorUsuarioId",
  "encerradoPorUsuarioId",
]);
const selectOrganizacao = Object.fromEntries(CAMPOS_ORGANIZACAO.map((campo) => [campo, true]));
const selectVinculo = Object.fromEntries(CAMPOS_VINCULO.map((campo) => [campo, true]));

function projetar(item, campos) {
  if (!item) return null;
  return Object.fromEntries(campos.filter((chave) => item[chave] !== undefined)
    .map((chave) => [chave, item[chave]]));
}
function erro(codigo, status = 400) {
  throw new ErroDominioOrganizacao(codigo, status);
}
function idSeguro(id) {
  if (typeof id !== "string" || !ID.test(id)) erro("ENTRADA_INVALIDA");
  return id;
}
function resposta(dados, status = 200) {
  return Response.json(dados, {
    status, headers: { "Cache-Control": SEM_CACHE },
  });
}
function pagina({ page, pageSize, total }) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function verificarQuery(req, permitidos) {
  const params = new URL(req.url).searchParams;
  for (const chave of params.keys()) {
    if (!permitidos.includes(chave) || params.getAll(chave).length !== 1) {
      erro("ENTRADA_INVALIDA");
    }
  }
  return params;
}
function filtroEnumerado(params, chave, permitidos) {
  const valor = params.get(chave);
  if (valor === null) return undefined;
  if (!permitidos.has(valor)) erro("ENTRADA_INVALIDA");
  return valor;
}
function checarPaginacao(params) {
  const resultado = validarPaginacaoOrganizacao(params);
  if (!resultado.valido || !Number.isSafeInteger((resultado.page - 1) * resultado.pageSize)) {
    erro("ENTRADA_INVALIDA");
  }
  return resultado;
}

// Cookies do ADMIN: exige Origin explícita, mesma origem da requisição e
// entrada explícita na allowlist do deploy. Nunca confiar somente em Host.
// A variável é intencionalmente NOVA e fail-closed, sem habilitar HML/PRD.
export function origemMutacaoPermitida(req) {
  const origem = req.headers.get("origin");
  const site = req.headers.get("sec-fetch-site");
  if (!origem || origem === "null" || (site && !["same-origin", "none"].includes(site))) return false;

  const configuracao = process.env.MGU_E72_ADMIN_ORIGINS || "";
  const origens = configuracao.split(",").map((valor) => valor.trim()).filter(Boolean);
  if (origens.length === 0) return false;

  try {
    const urlOrigem = new URL(origem);
    const urlRequisicao = new URL(req.url);
    if (urlOrigem.origin !== origem || urlRequisicao.origin !== origem) return false;
    if (!["http:", "https:"].includes(urlOrigem.protocol)) return false;
    if (urlOrigem.username || urlOrigem.password) return false;
    // http somente para execução local, jamais para domínios públicos.
    if (urlOrigem.protocol === "http:"
      && !["localhost", "127.0.0.1", "[::1]"].includes(urlOrigem.hostname)) return false;
    return origens.some((item) => {
      try {
        const candidato = new URL(item);
        return candidato.origin === item && candidato.origin === origem;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

// Leitura incremental com limite real de bytes: Content-Length não é confiável.
// Abortamos antes de armazenar todo o payload.
async function lerJson(req) {
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("content-type") || "")) {
    erro("ENTRADA_INVALIDA");
  }
  let texto = "";
  const leitor = req.body?.getReader();
  if (!leitor) erro("ENTRADA_INVALIDA");
  let total = 0;
  const decodificador = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_CORPO_BYTES) {
        await leitor.cancel();
        erro("ENTRADA_INVALIDA");
      }
      texto += decodificador.decode(value, { stream: true });
    }
    texto += decodificador.decode();
    const valor = JSON.parse(texto);
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) erro("ENTRADA_INVALIDA");
    return valor;
  } catch (e) {
    if (e instanceof ErroDominioOrganizacao) throw e;
    erro("ENTRADA_INVALIDA");
  } finally {
    leitor.releaseLock();
  }
}
async function objetoVazio(req) {
  const valor = await lerJson(req);
  if (!valor || typeof valor !== "object" || Array.isArray(valor)
    || Object.keys(valor).length !== 0) erro("ENTRADA_INVALIDA");
}

function itensPaginados(items, dados) {
  return resposta({ items, pagination: pagina({ ...dados, total: dados.total }) });
}
const ROTAS_LEITURA = new Set(["listarOrganizacoes", "obterOrganizacao", "listarVinculos"]);

export async function executarOperacaoOrganizacoes(req, operacao, context = {}) {
  try {
    const acesso = await obterAcessoAdmin();
    if (!acesso?.permitido) {
      return respostaAcessoNegado(acesso || { status: 401, motivo: "Não autorizado." });
    }
    // defesa adicional: o serviço D2 exige a mesma identidade canônica.
    if (acesso.ehAdmin !== true || acesso.conta?.role !== "ADMIN"
      || acesso.conta?.ativo !== true || acesso.conta?.mustChangePassword
      || typeof acesso.conta?.usuarioId !== "string" || !ID.test(acesso.conta.usuarioId)) {
      return respostaAcessoNegado({ status: 403, motivo: "Acesso restrito a administradores." });
    }
    if (!ROTAS_LEITURA.has(operacao) && !origemMutacaoPermitida(req)) {
      return resposta({ error: "Origem não autorizada.", code: "ORIGEM_NAO_AUTORIZADA" }, 403);
    }

    const params = await context.params || {};
    const orgId = operacao === "listarOrganizacoes" || operacao === "criarOrganizacao"
      ? null : idSeguro(params.id);
    const vinculoId = ["editarFuncaoVinculo", "ativarVinculo", "encerrarVinculo"].includes(operacao)
      ? idSeguro(params.vinculoId) : null;

    if (operacao === "listarOrganizacoes") {
      const query = verificarQuery(req, ["page", "pageSize", "q", "statusValidacao", "statusOperacional"]);
      const { page, pageSize, q } = checarPaginacao(query);
      const statusValidacao = filtroEnumerado(query, "statusValidacao", STATUS_VALIDACAO);
      const statusOperacional = filtroEnumerado(query, "statusOperacional", STATUS_OPERACIONAL);
      const where = {
        ...(statusValidacao ? { statusValidacao } : {}),
        ...(statusOperacional ? { statusOperacional } : {}),
        ...(q ? { OR: ["nomeFantasia", "razaoSocial", "cnpj", "email"].map((campo) => ({
          [campo]: { contains: q, mode: "insensitive" },
        })) } : {}),
      };
      const [total, items] = await Promise.all([
        prisma.organizacao.count({ where }),
        prisma.organizacao.findMany({
          where, select: selectOrganizacao,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (page - 1) * pageSize, take: pageSize,
        }),
      ]);
      return itensPaginados(items.map((item) => projetar(item, CAMPOS_ORGANIZACAO)), { page, pageSize, total });
    }

    if (operacao === "obterOrganizacao") {
      verificarQuery(req, []);
      const item = await prisma.organizacao.findUnique({
        where: { id: orgId }, select: selectOrganizacao,
      });
      if (!item) erro("NAO_ENCONTRADO", 404);
      return resposta({ item: projetar(item, CAMPOS_ORGANIZACAO) });
    }

    if (operacao === "listarVinculos") {
      const query = verificarQuery(req, ["page", "pageSize", "status", "pessoaId"]);
      const { page, pageSize } = checarPaginacao(query);
      const status = filtroEnumerado(query, "status", STATUS_VINCULO);
      const pessoaId = query.get("pessoaId") === null ? undefined : idSeguro(query.get("pessoaId"));
      const existente = await prisma.organizacao.findUnique({
        where: { id: orgId }, select: { id: true },
      });
      if (!existente) erro("NAO_ENCONTRADO", 404);
      const where = { organizacaoId: orgId, ...(status ? { status } : {}), ...(pessoaId ? { pessoaId } : {}) };
      const [total, items] = await Promise.all([
        prisma.pessoaOrganizacao.count({ where }),
        prisma.pessoaOrganizacao.findMany({
          where, select: selectVinculo,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (page - 1) * pageSize, take: pageSize,
        }),
      ]);
      return itensPaginados(items.map((item) => projetar(item, CAMPOS_VINCULO)), { page, pageSize, total });
    }

    // Métodos de escrita: apenas os campos explicitamente repassados ao serviço.
    verificarQuery(req, []);
    const servicos = criarServicosOrganizacao({ prisma, acesso });
    let item;
    let status = 200;
    switch (operacao) {
      case "criarOrganizacao":
        item = await servicos.criar(await lerJson(req));
        status = 201;
        break;
      case "editarOrganizacao":
        item = await servicos.editar(orgId, await lerJson(req));
        break;
      case "decidirValidacao":
        item = await servicos.decidirValidacao(orgId, await lerJson(req));
        break;
      case "alterarOperacao":
        item = await servicos.alterarOperacao(orgId, await lerJson(req));
        break;
      case "criarVinculo":
        item = await servicos.criarVinculo(orgId, await lerJson(req));
        status = 201;
        break;
      case "editarFuncaoVinculo":
        item = await servicos.editarFuncaoVinculo(orgId, vinculoId, await lerJson(req));
        break;
      case "ativarVinculo":
        await objetoVazio(req);
        item = await servicos.ativarVinculo(orgId, vinculoId);
        break;
      case "encerrarVinculo":
        await objetoVazio(req);
        item = await servicos.encerrarVinculo(orgId, vinculoId);
        break;
      case "definirPrincipal":
        item = await servicos.definirPrincipal(orgId, await lerJson(req));
        return resposta({
          item: { organizacaoId: item.organizacaoId, vinculoId: item.vinculoId, alterado: item.alterado },
        });
      default:
        erro("NAO_ENCONTRADO", 404);
    }
    const campos = ["criarVinculo", "editarFuncaoVinculo", "ativarVinculo", "encerrarVinculo"].includes(operacao)
      ? CAMPOS_VINCULO : CAMPOS_ORGANIZACAO;
    return resposta({ item: projetar(item, campos) }, status);
  } catch (e) {
    const traduzido = traduzirErroUnicidadeOrganizacao(e);
    if (traduzido instanceof ErroDominioOrganizacao) {
      return resposta({ error: traduzido.codigo, code: traduzido.codigo }, traduzido.status);
    }
    // Não devolver erro bruto de Prisma, SQL, URL, stack, CNPJ ou dados pessoais.
    return resposta({ error: "Erro interno.", code: "ERRO_INTERNO" }, 500);
  }
}
