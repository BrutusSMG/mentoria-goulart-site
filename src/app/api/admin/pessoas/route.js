import { obterAcessoAdmin, prisma, respostaAcessoNegado } from "@/lib/admin-permissoes";
import { origemMutacaoPermitida } from "@/lib/http-organizacoes-admin";
import { criarServicosPessoasAdmin, ErroPessoaAdmin, traduzirErroPessoa } from "@/lib/servicos-pessoas-admin";
import { verificarLimitePessoasAdmin, ErroLimitePessoasAdmin } from "@/lib/limite-pessoas-admin";

const SEM_CACHE = { "Cache-Control": "private, no-store, max-age=0" };
const responder = (dados, status = 200) => Response.json(dados, { status, headers: SEM_CACHE });

async function executar(req, operacao) {
  try {
    const acesso = await obterAcessoAdmin();
    if (!acesso?.permitido) return respostaAcessoNegado(acesso || { status: 401, motivo: "Não autorizado." });
    if (acesso.ehAdmin !== true || acesso.conta?.role !== "ADMIN" ||
      acesso.conta?.ativo !== true || acesso.conta?.mustChangePassword ||
      typeof acesso.conta?.usuarioId !== "string") {
      return responder({ code: "ACESSO_NEGADO", error: "Acesso restrito." }, 403);
    }
    const servicos = criarServicosPessoasAdmin({ prisma, acesso });
    await verificarLimitePessoasAdmin({ prisma, usuarioId: acesso.conta.usuarioId, operacao });
    if (operacao === "GET") {
      const resultado = await servicos.buscar(new URL(req.url).searchParams);
      return responder(resultado);
    }
    if (!origemMutacaoPermitida(req)) {
      return responder({ code: "ORIGEM_NAO_AUTORIZADA", error: "Origem não autorizada." }, 403);
    }
    if (new URL(req.url).search) throw new ErroPessoaAdmin("ENTRADA_INVALIDA");
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers.get("content-type") || "")) {
      throw new ErroPessoaAdmin("ENTRADA_INVALIDA");
    }
    if (!req.body) throw new ErroPessoaAdmin("ENTRADA_INVALIDA");
    const leitor = req.body.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let bytes = 0;
    let texto = "";
    try {
      while (true) {
        const { done, value } = await leitor.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 16 * 1024) {
          await leitor.cancel();
          throw new ErroPessoaAdmin("ENTRADA_INVALIDA");
        }
        try { texto += decoder.decode(value, { stream: true }); }
        catch { throw new ErroPessoaAdmin("ENTRADA_INVALIDA"); }
      }
      try { texto += decoder.decode(); }
      catch { throw new ErroPessoaAdmin("ENTRADA_INVALIDA"); }
    } finally {
      leitor.releaseLock();
    }
    let entrada;
    try { entrada = JSON.parse(texto); } catch { throw new ErroPessoaAdmin("ENTRADA_INVALIDA"); }
    const item = await servicos.criar(entrada);
    return responder({ item }, 201);
  } catch (erro) {
    const convertido = traduzirErroPessoa(erro);
    if (convertido instanceof ErroLimitePessoasAdmin) {
      return Response.json({ code: convertido.codigo, error: convertido.codigo }, {
        status: convertido.status,
        headers: { ...SEM_CACHE, ...(convertido.retryAfter ? { "Retry-After": String(convertido.retryAfter) } : {}) },
      });
    }
    if (convertido instanceof ErroPessoaAdmin) {
      return responder({ code: convertido.codigo, error: convertido.codigo }, convertido.status);
    }
    return responder({ code: "ERRO_INTERNO", error: "Erro interno." }, 500);
  }
}

export async function GET(req) { return executar(req, "GET"); }
export async function POST(req) { return executar(req, "POST"); }
