// src/app/aluno/(portal)/perfil/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { alunoTemContaAtiva } from '@/lib/acesso-aluno';
import { temContextoAluno } from '@/lib/contextos-sessao';

export default async function PerfilAlunoLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const usuario = sessao?.user;

  if (!temContextoAluno(usuario)) {
    redirect('/aluno');
  }

  const contaAtiva = await alunoTemContaAtiva(
    usuario.alunoId,
  );

  if (!contaAtiva) {
    redirect('/aluno');
  }

  return children;
}
