// src/app/aluno/(portal)/comunidade/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { alunoTemAcessoComunidade } from '@/lib/direitos-produto';

export default async function ComunidadeLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const tipoConta = sessao?.user?.tipoConta;

  if (tipoConta === 'ADMIN') {
    return children;
  }

  if (tipoConta !== 'ALUNO') {
    redirect('/aluno/login');
  }

  const acessoComunidade = await alunoTemAcessoComunidade(
    sessao?.user?.alunoId,
  );

  if (!acessoComunidade) {
    redirect('/aluno');
  }

  return children;
}
