// src/app/aluno/(portal)/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {
  temContextoAdministrativo,
  temContextoAluno,
} from '@/lib/contextos-sessao';

export default async function PortalAlunoLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const usuario = sessao?.user;

  if (
    !temContextoAluno(usuario) &&
    !temContextoAdministrativo(usuario)
  ) {
    redirect('/aluno/login');
  }

  return children;
}
