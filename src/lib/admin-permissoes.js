// src/lib/admin-permissoes.js
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prismaAdminPermissoes || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdminPermissoes = prisma;
}

const CAMPO_DO_MODULO = {
  SUCATAS: "podeGerenciarSucatas",
  DEPOIMENTOS: "podeGerenciarDepoimentos",
  JORNADA: "podeGerenciarJornada",
};

export async function obterAcessoAtual() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { permitido: false, status: 401, motivo: "Não autorizado." };
  }

  const conta = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      mustChangePassword: true,
      podeGerenciarSucatas: true,
      podeGerenciarDepoimentos: true,
      podeGerenciarJornada: true,
    },
  });

  if (!conta?.ativo) {
    return { permitido: false, status: 403, motivo: "Conta inativa." };
  }

  return { permitido: true, status: 200, conta };
}

export async function obterAcessoModulo(modulo) {
  const acesso = await obterAcessoAtual();
  if (!acesso.permitido) return acesso;

  const campo = CAMPO_DO_MODULO[modulo];
  const ehAdmin = acesso.conta.role === "ADMIN";
  const ehParceiroAutorizado =
    acesso.conta.role === "PARCEIRO" && Boolean(acesso.conta[campo]);

  if (!ehAdmin && !ehParceiroAutorizado) {
    return {
      permitido: false,
      status: 403,
      motivo: "Você não possui permissão para este módulo.",
      conta: acesso.conta,
    };
  }

  return {
    permitido: true,
    status: 200,
    conta: acesso.conta,
    ehAdmin,
  };
}

export async function obterAcessoAdmin() {
  const acesso = await obterAcessoAtual();
  if (!acesso.permitido) return acesso;

  if (acesso.conta.role !== "ADMIN") {
    return {
      permitido: false,
      status: 403,
      motivo: "Acesso restrito a administradores.",
      conta: acesso.conta,
    };
  }

  return { permitido: true, status: 200, conta: acesso.conta, ehAdmin: true };
}

export function respostaAcessoNegado(acesso) {
  return Response.json(
    { error: acesso.motivo || "Acesso negado." },
    {
      status: acesso.status || 403,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}