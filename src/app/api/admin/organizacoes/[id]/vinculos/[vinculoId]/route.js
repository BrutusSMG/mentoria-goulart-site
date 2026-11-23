// E7.2/D3: ADMIN. Integração com schema Prisma ainda pendente.
import { executarOperacaoOrganizacoes } from "@/lib/http-organizacoes-admin";

export async function PATCH(req, context) {
  return executarOperacaoOrganizacoes(req, "editarFuncaoVinculo", context);
}
