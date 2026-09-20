// src/app/aluno/(portal)/perfil/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { alunoTemContaAtiva } from '@/lib/acesso-aluno';

export default async function PerfilAlunoLayout({ children }) {
  const sessao = await getServerSession(authOptions);

  if (sessao?.user?.tipoConta !== 'ALUNO') {
    redirect('/aluno');
  }

  const contaAtiva = await alunoTemContaAtiva(
    sessao?.user?.alunoId,
  );

  if (!contaAtiva) {
    redirect('/aluno');
  }

  return children;
}
