// src/app/aluno/(portal)/comunidade/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  temContextoAdministrativo,
  temContextoAluno,
} from '@/lib/contextos-sessao';
import { alunoTemAcessoComunidade } from '@/lib/direitos-produto';

export default async function ComunidadeLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const usuario = sessao?.user;

  if (temContextoAdministrativo(usuario)) {
    return children;
  }

  if (!temContextoAluno(usuario)) {
    redirect('/aluno/login');
  }

  const acessoComunidade = await alunoTemAcessoComunidade(
    usuario.alunoId,
  );

  if (!acessoComunidade) {
    redirect('/aluno');
  }

  return children;
}
