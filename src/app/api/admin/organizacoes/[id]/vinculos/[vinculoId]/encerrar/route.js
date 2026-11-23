// E7.2/D3: ADMIN. Integração com schema Prisma ainda pendente.
import { executarOperacaoOrganizacoes } from "@/lib/http-organizacoes-admin";

export async function POST(req, context) {
  return executarOperacaoOrganizacoes(req, "encerrarVinculo", context);
}
