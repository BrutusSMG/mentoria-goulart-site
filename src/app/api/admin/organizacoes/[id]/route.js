// E7.2/D3: rotas ADMIN; só serão operacionais após schema/integração autorizados.
import { executarOperacaoOrganizacoes } from "@/lib/http-organizacoes-admin";

export async function GET(req, context) {
  return executarOperacaoOrganizacoes(req, "obterOrganizacao", context);
}
export async function PATCH(req, context) {
  return executarOperacaoOrganizacoes(req, "editarOrganizacao", context);
}