// src/app/api/admin/usuarios/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

  if (!session?.user?.id) {
    return { erro: respostaPrivada({ error: "Não autorizado" }, 401) };
  }

  const contaAtual = await prisma.adminUser.findUnique({
    where: { id: session.user.id },
    select: { ativo: true, role: true },
  });

  if (!contaAtual?.ativo || contaAtual.role !== "ADMIN") {
    return { erro: respostaPrivada({ error: "Acesso restrito a administradores" }, 403) };
  }

  return { session, contaAtual };
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

export async function GET() {
  const acesso = await exigirAdmin();
  if (acesso.erro) return acesso.erro;

  try {
    const usuarios = await prisma.adminUser.findMany({
      select: camposSeguros,
      orderBy: [{ ativo: "desc" }, { createdAt: "desc" }],
    });

    return respostaPrivada({ items: usuarios });
  } catch (error) {
    console.error("Erro ao listar usuários administrativos:", error?.message);
    return respostaPrivada({ error: "Não foi possível carregar as contas." }, 500);
  }
}

export async function POST(req) {
  const acesso = await exigirAdmin();
  if (acesso.erro) return acesso.erro;

  try {
    const body = await req.json();
    const nome = String(body?.nome || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = String(body?.role || "").trim();
    const senhaTemporaria = body?.senhaTemporaria;

    if (nome.length < 2 || nome.length > 120) {
      return respostaPrivada({ error: "Informe um nome entre 2 e 120 caracteres." }, 400);
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return respostaPrivada({ error: "Informe um e-mail válido." }, 400);
    }

    if (!ROLES_VALIDOS.includes(role)) {
      return respostaPrivada({ error: "Perfil de acesso inválido." }, 400);
    }

    const podeGerenciarSucatas =
      role === "PARCEIRO" && body?.podeGerenciarSucatas === true;

    const podeGerenciarDepoimentos =
      role === "PARCEIRO" && body?.podeGerenciarDepoimentos === true;

    const podeGerenciarJornada =
      role === "PARCEIRO" && body?.podeGerenciarJornada === true;

    if (!senhaValida(senhaTemporaria)) {
      return respostaPrivada({ error: "A senha temporária deve ter no mínimo 12 caracteres." }, 400);
    }

    const existente = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existente) {
      return respostaPrivada({ error: "Já existe uma conta com este e-mail." }, 409);
    }

    const senhaHash = await bcrypt.hash(senhaTemporaria, 12);

    const usuario = await prisma.adminUser.create({
      data: {
        nome,
        email,
        role,
        senha: senhaHash,
        ativo: true,
        podeGerenciarSucatas,
        podeGerenciarDepoimentos,
        podeGerenciarJornada,
        mustChangePassword: true,
      },
      select: camposSeguros,
    });

    return respostaPrivada({ item: usuario }, 201);
  } catch (error) {
    console.error("Erro ao criar usuário administrativo:", error?.message);
    return respostaPrivada({ error: "Não foi possível criar a conta." }, 500);
  }
}