// src/app/api/alunos/meu-perfil/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const CAMPOS_TEXTO = ['nomeExibicao', 'fotoUrl', 'cidade', 'estado', 'bio', 'experiencia', 'objetivos'];
const CAMPOS_BOOLEANOS = ['mostrarFoto', 'mostrarLocalizacao', 'mostrarBio', 'mostrarExperiencia', 'mostrarObjetivos', 'mostrarWhatsapp'];

function respostaErro(erro, status = 400) {
  return NextResponse.json({ ok: false, erro }, { status });
}

async function obterAlunoAutenticado() {
  const session = await getServerSession(authOptions);
  const alunoId = session?.user?.tipoConta === 'ALUNO' ? session.user.alunoId : null;
  return alunoId || null;
}

function textoSeguro(valor, limite) {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim();
  return texto ? texto.slice(0, limite) : null;
}

function booleanoSeguro(valor) {
  return valor === true;
}

function validarAtualizacao(body) {
  const dados = {};

  for (const campo of CAMPOS_TEXTO) {
    if (Object.prototype.hasOwnProperty.call(body, campo)) {
      const limite = ['bio', 'experiencia', 'objetivos'].includes(campo) ? 2000 : 255;
      dados[campo] = textoSeguro(body[campo], limite);
    }
  }

  for (const campo of CAMPOS_BOOLEANOS) {
    if (Object.prototype.hasOwnProperty.call(body, campo)) {
      dados[campo] = booleanoSeguro(body[campo]);
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'visibilidade')) {
    if (!['PRIVADO', 'ALUNOS'].includes(body.visibilidade)) {
      throw new Error('Visibilidade inválida.');
    }
    dados.visibilidade = body.visibilidade;
  }

  if (dados.estado && dados.estado.length > 2) {
    throw new Error('Estado deve ter até 2 caracteres.');
  }

  if (dados.fotoUrl && !/^https:\/\//i.test(dados.fotoUrl )) {
    throw new Error('A foto precisa usar uma URL HTTPS.');
  }

  if (dados.visibilidade === 'PRIVADO') {
    dados.mostrarFoto = false;
    dados.mostrarLocalizacao = false;
    dados.mostrarBio = false;
    dados.mostrarExperiencia = false;
    dados.mostrarObjetivos = false;
    dados.mostrarWhatsapp = false;
  }

  return dados;
}

function formatoPerfil(aluno) {
  const perfil = aluno.perfil || {};

  return {
    ok: true,
    aluno: {
      nome: aluno.nome,
      email: aluno.email,
      whatsapp: aluno.whatsapp,
    },
    perfil: {
      nomeExibicao: perfil.nomeExibicao || aluno.nome,
      fotoUrl: perfil.fotoUrl || '',
      cidade: perfil.cidade || '',
      estado: perfil.estado || '',
      bio: perfil.bio || '',
      experiencia: perfil.experiencia || '',
      objetivos: perfil.objetivos || '',
      mostrarFoto: perfil.mostrarFoto,
      mostrarLocalizacao: perfil.mostrarLocalizacao,
      mostrarBio: perfil.mostrarBio,
      mostrarExperiencia: perfil.mostrarExperiencia,
      mostrarObjetivos: perfil.mostrarObjetivos,
      mostrarWhatsapp: perfil.mostrarWhatsapp,
      visibilidade: perfil.visibilidade,
    },
  };
}

export async function GET() {
  const alunoId = await obterAlunoAutenticado();
  if (!alunoId) return respostaErro('Acesso não autorizado.', 401);

  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
    select: {
      nome: true,
      email: true,
      whatsapp: true,
      perfil: true,
    },
  });

  if (!aluno) return respostaErro('Aluno não encontrado.', 404);
  return NextResponse.json(formatoPerfil(aluno));
}

export async function PATCH(request) {
  const alunoId = await obterAlunoAutenticado();
  if (!alunoId) return respostaErro('Acesso não autorizado.', 401);

  try {
    const body = await request.json();
    const dados = validarAtualizacao(body || {});

    const perfil = await prisma.perfilAluno.upsert({
      where: { alunoId },
      update: dados,
      create: { alunoId, ...dados },
    });

    if (Object.prototype.hasOwnProperty.call(body, 'nomeExibicao') && body.nomeExibicao) {
      await prisma.aluno.update({
        where: { id: alunoId },
        data: { nome: textoSeguro(body.nomeExibicao, 255) },
      });
    }

    return NextResponse.json({ ok: true, perfil });
  } catch (error) {
    return respostaErro(error?.message || 'Não foi possível salvar o perfil.');
  }
}