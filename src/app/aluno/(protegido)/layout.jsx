// src/app/aluno/(protegido)/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { alunoTemAcessoAtivo } from '@/lib/acesso-aluno';

export default async function AlunoProtegidoLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const tipoConta = sessao?.user?.tipoConta;

  if (!['ALUNO', 'ADMIN'].includes(tipoConta)) {
    redirect('/aluno/login');
  }

  // ADMIN possui exceção administrativa para acessar a Área do Aluno.
  if (tipoConta === 'ALUNO') {
    const alunoId = sessao?.user?.alunoId;

    const acessoAtivo = await alunoTemAcessoAtivo(alunoId);

    if (!acessoAtivo) {
      redirect('/aluno/acesso-indisponivel');
    }
  }

  return children;
}
