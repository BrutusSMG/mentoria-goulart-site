// src/app/api/alunos/comunidade/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { alunoTemAcessoComunidade } from '@/lib/direitos-produto';
import {
  temContextoAdministrativo,
  temContextoAluno,
} from '@/lib/contextos-sessao';

export async function GET() {
  const session = await getServerSession(authOptions);
  const usuario = session?.user;

  if (
    !temContextoAluno(usuario) &&
    !temContextoAdministrativo(usuario)
  ) {
    return NextResponse.json(
      { ok: false, erro: 'Acesso não autorizado.' },
      { status: 401 },
    );
  }

  if (!temContextoAdministrativo(usuario)) {
    const acessoComunidade = await alunoTemAcessoComunidade(
      usuario.alunoId,
    );

    if (!acessoComunidade) {
      return NextResponse.json(
        { ok: false, erro: 'Acesso indisponível.' },
        { status: 403 },
      );
    }
  }

  const perfis = await prisma.perfilAluno.findMany({
    where: {
      visibilidade: 'ALUNOS',
      aluno: { status: 'ATIVO' },
    },
    select: {
      alunoId: true,
      nomeExibicao: true,
      fotoUrl: true,
      cidade: true,
      estado: true,
      bio: true,
      experiencia: true,
      objetivos: true,
      mostrarFoto: true,
      mostrarLocalizacao: true,
      mostrarBio: true,
      mostrarExperiencia: true,
      mostrarObjetivos: true,
      mostrarWhatsapp: true,
      aluno: {
        select: {
          pessoa: {
            select: {
              nome: true,
              telefonePrincipal: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  const comunidade = perfis.map((perfil) => ({
    id: perfil.alunoId,
    nome:
      perfil.nomeExibicao ||
      perfil.aluno.pessoa?.nome ||
      'Aluno',
    fotoUrl: perfil.mostrarFoto ? perfil.fotoUrl : null,
    cidade: perfil.mostrarLocalizacao ? perfil.cidade : null,
    estado: perfil.mostrarLocalizacao ? perfil.estado : null,
    bio: perfil.mostrarBio ? perfil.bio : null,
    experiencia: perfil.mostrarExperiencia ? perfil.experiencia : null,
    objetivos: perfil.mostrarObjetivos ? perfil.objetivos : null,
    whatsapp:
      perfil.mostrarWhatsapp
        ? perfil.aluno.pessoa?.telefonePrincipal || null
        : null,
  }));
  return NextResponse.json({ ok: true, alunos: comunidade });
}
