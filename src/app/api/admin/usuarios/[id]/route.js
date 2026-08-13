// src/app/api/admin/usuarios/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();
const ROLES_VALIDOS = ["ADMIN", "PARCEIRO", "FORNECEDOR"];

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

function senhaValida(senha) {
  return typeof senha === "string" && senha.length >= 12;
}

async function exigirAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) return { erro: respostaPrivada({ error: "Não autorizado" }, 401) };
  if (session.user?.role !== "ADMIN") {
    return { erro: respostaPrivada({ error: "Acesso restrito a administradores" }, 403) };
  }

  return { session };
}

const camposSeguros = {
  id: true,
  nome: true,
  email: true,
  role: true,
  ativo: true,
  mustChangePassword: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function PATCH(req, { params }) {
  const acesso = await exigirAdmin();
  if (acesso.erro) return acesso.erro;

  const { id } = await params;

  try {
    const body = await req.json();
    const alvo = await prisma.adminUser.findUnique({ where: { id } });

    if (!alvo) return respostaPrivada({ error: "Conta não encontrada." }, 404);

    const editandoPropriaConta = alvo.id === acesso.session.user.id;
    const nome = body?.nome === undefined ? alvo.nome : String(body.nome).trim();
    const role = body?.role === undefined ? alvo.role : String(body.role).trim();
    const ativo = body?.ativo === undefined ? alvo.ativo : Boolean(body.ativo);
    const senhaTemporaria = body?.senhaTemporaria;

    if (nome.length < 2 || nome.length > 120) {
      return respostaPrivada({ error: "Informe um nome entre 2 e 120 caracteres." }, 400);
    }

    if (!ROLES_VALIDOS.includes(role)) {
      return respostaPrivada({ error: "Perfil de acesso inválido." }, 400);
    }

    if (editandoPropriaConta && (role !== alvo.role || ativo !== alvo.ativo)) {
      return respostaPrivada(
        { error: "Por segurança, não altere seu próprio perfil ou status por esta tela." },
        400,
      );
    }

    const removeAdminAtivo = alvo.role === "ADMIN" && alvo.ativo && (role !== "ADMIN" || !ativo);

    if (removeAdminAtivo) {
      const totalAdminsAtivos = await prisma.adminUser.count({
        where: { role: "ADMIN", ativo: true },
      });

      if (totalAdminsAtivos <= 1) {
        return respostaPrivada(
          { error: "Não é permitido desativar ou rebaixar o último ADMIN ativo." },
          400,
        );
      }
    }

    const dadosAtualizacao = { nome, role, ativo };

    if (senhaTemporaria !== undefined && senhaTemporaria !== "") {
      if (!senhaValida(senhaTemporaria)) {
        return respostaPrivada({ error: "A nova senha temporária deve ter no mínimo 12 caracteres." }, 400);
      }

      dadosAtualizacao.senha = await bcrypt.hash(senhaTemporaria, 12);
      dadosAtualizacao.mustChangePassword = true;
      dadosAtualizacao.passwordChangedAt = null;
    }

    const usuario = await prisma.adminUser.update({
      where: { id },
      data: dadosAtualizacao,
      select: camposSeguros,
    });

    return respostaPrivada({ item: usuario });
  } catch (error) {
    console.error("Erro ao atualizar usuário administrativo:", error?.message);
    return respostaPrivada({ error: "Não foi possível atualizar a conta." }, 500);
  }
}