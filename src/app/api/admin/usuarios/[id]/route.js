// src/app/api/admin/usuarios/[id]/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  obterAcessoAdmin,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";
import {
  nomeAdminValido,
  roleAdminValida,
  senhaAdminValida,
} from "@/lib/validacoes";

function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

const camposSeguros = {
  id: true,
  nome: true,
  email: true,
  role: true,
  ativo: true,
  podeGerenciarSucatas: true,
  podeGerenciarDepoimentos: true,
  podeGerenciarJornada: true,
  mustChangePassword: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function PATCH(req, { params }) {
  const acesso = await obterAcessoAdmin();
  if (!acesso.permitido) return respostaAcessoNegado(acesso);

  const { id } = await params;

  try {
    const body = await req.json();
    const alvo = await prisma.adminUser.findUnique({ where: { id } });

    if (!alvo) return respostaPrivada({ error: "Conta não encontrada." }, 404);

    const editandoPropriaConta = alvo.id === acesso.conta.id;
    const nome = body?.nome === undefined ? alvo.nome : String(body.nome).trim();
    const role = body?.role === undefined ? alvo.role : String(body.role).trim();
    const ativo = body?.ativo === undefined ? alvo.ativo : Boolean(body.ativo);
    const senhaTemporaria = body?.senhaTemporaria;

    if (!nomeAdminValido(nome)) {
      return respostaPrivada({ error: "Informe um nome entre 2 e 120 caracteres." }, 400);
    }

    if (!roleAdminValida(role)) {
      return respostaPrivada({ error: "Perfil de acesso inválido." }, 400);
    }
    const podeGerenciarSucatas =
      role === "PARCEIRO" && body?.podeGerenciarSucatas === true;
    const podeGerenciarDepoimentos =
      role === "PARCEIRO" && body?.podeGerenciarDepoimentos === true;
    const podeGerenciarJornada =
      role === "PARCEIRO" && body?.podeGerenciarJornada === true;

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

    const dadosAtualizacao = {
      nome,
      role,
      ativo,
      podeGerenciarSucatas,
      podeGerenciarDepoimentos,
      podeGerenciarJornada,
    };

    if (senhaTemporaria !== undefined && senhaTemporaria !== "") {
      if (!senhaAdminValida(senhaTemporaria)) {
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