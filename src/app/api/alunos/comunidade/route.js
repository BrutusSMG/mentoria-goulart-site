// src/app/api/alunos/comunidade/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.tipoConta !== 'ALUNO' || !session.user.alunoId) {
    return NextResponse.json({ ok: false, erro: 'Acesso não autorizado.' }, { status: 401 });
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
          nome: true,
          whatsapp: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const comunidade = perfis.map((perfil) => ({
    id: perfil.alunoId,
    nome: perfil.nomeExibicao || perfil.aluno.nome,
    fotoUrl: perfil.mostrarFoto ? perfil.fotoUrl : null,
    cidade: perfil.mostrarLocalizacao ? perfil.cidade : null,
    estado: perfil.mostrarLocalizacao ? perfil.estado : null,
    bio: perfil.mostrarBio ? perfil.bio : null,
    experiencia: perfil.mostrarExperiencia ? perfil.experiencia : null,
    objetivos: perfil.mostrarObjetivos ? perfil.objetivos : null,
    whatsapp: perfil.mostrarWhatsapp ? perfil.aluno.whatsapp : null,
  }));

  return NextResponse.json({ ok: true, alunos: comunidade });
}