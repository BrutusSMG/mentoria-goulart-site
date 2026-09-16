// src/app/aluno/(portal)/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function PortalAlunoLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const tipoConta = sessao?.user?.tipoConta;

  if (!['ALUNO', 'ADMIN'].includes(tipoConta)) {
    redirect('/aluno/login');
  }

  return children;
}
