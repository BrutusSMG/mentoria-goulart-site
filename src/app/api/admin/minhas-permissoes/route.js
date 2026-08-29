// src/app/api/admin/minhas-permissoes/route.js
import { obterAcessoAtual, respostaAcessoNegado } from "@/lib/admin-permissoes";

export async function GET() {
  const acesso = await obterAcessoAtual();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  return Response.json({
    role: acesso.conta.role,
    ehAdmin: acesso.conta.role === "ADMIN",
    podeGerenciarSucatas: acesso.conta.role === "ADMIN" || acesso.conta.podeGerenciarSucatas,
    podeGerenciarDepoimentos: acesso.conta.role === "ADMIN" || acesso.conta.podeGerenciarDepoimentos,
    podeGerenciarJornada: acesso.conta.role === "ADMIN" || acesso.conta.podeGerenciarJornada,
  }, { headers: { "Cache-Control": "private, no-store" } });
}