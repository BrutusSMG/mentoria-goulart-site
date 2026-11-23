// E7.2/D3: rotas ADMIN; só serão operacionais após schema/integração autorizados.
import { executarOperacaoOrganizacoes } from "@/lib/http-organizacoes-admin";

export async function GET(req, context) {
  return executarOperacaoOrganizacoes(req, "listarOrganizacoes", context);
}
export async function POST(req, context) {
  return executarOperacaoOrganizacoes(req, "criarOrganizacao", context);
}