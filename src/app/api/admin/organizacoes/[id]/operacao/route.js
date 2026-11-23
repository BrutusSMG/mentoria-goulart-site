// E7.2/D3: mutação ADMIN; requer schema Prisma e integração posterior.
import { executarOperacaoOrganizacoes } from "@/lib/http-organizacoes-admin";

export async function POST(req, context) {
  return executarOperacaoOrganizacoes(req, "alterarOperacao", context);
}
