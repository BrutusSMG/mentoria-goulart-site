// src/app/api/admin/alterar-minha-senha/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  obterAcessoAtual,
  prisma,
  respostaAcessoNegado,
} from "@/lib/admin-permissoes";


function respostaPrivada(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(req) {
  const acesso = await obterAcessoAtual();

  if (!acesso.permitido) {
    return respostaAcessoNegado(acesso);
  }

  try {
    const body = await req.json();
    const senhaTemporaria = String(body?.senhaTemporaria || "");
    const novaSenha = String(body?.novaSenha || "");
    const confirmarSenha = String(body?.confirmarSenha || "");

    if (!senhaTemporaria || !novaSenha || !confirmarSenha) {
      return respostaPrivada({ error: "Preencha todos os campos." }, 400);
    }

    if (novaSenha.length < 12) {
      return respostaPrivada({ error: "A nova senha deve ter no mínimo 12 caracteres." }, 400);
    }

    if (novaSenha !== confirmarSenha) {
      return respostaPrivada({ error: "A confirmação da nova senha não confere." }, 400);
    }

    if (senhaTemporaria === novaSenha) {
      return respostaPrivada({ error: "A nova senha deve ser diferente da senha temporária." }, 400);
    }

    const usuario = await prisma.adminUser.findUnique({
      where: { id: acesso.conta.id },
      select: {
        id: true,
        senha: true,
        ativo: true,
        mustChangePassword: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return respostaPrivada({ error: "Conta indisponível." }, 403);
    }

    if (!usuario.mustChangePassword) {
      return respostaPrivada({ error: "Esta conta não possui troca de senha pendente." }, 400);
    }

    const senhaTemporariaCorreta = await bcrypt.compare(senhaTemporaria, usuario.senha);

    if (!senhaTemporariaCorreta) {
      return respostaPrivada({ error: "A senha temporária informada está incorreta." }, 400);
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await prisma.adminUser.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
    });

    return respostaPrivada({ success: true });
  } catch (error) {
    console.error("Erro ao alterar senha de primeiro acesso:", error?.message);
    return respostaPrivada({ error: "Não foi possível alterar a senha." }, 500);
  }
}