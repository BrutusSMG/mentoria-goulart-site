// src/app/aluno/(educacional)/layout.jsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { alunoTemAcessoAtivo } from '@/lib/acesso-aluno';
import {
  temContextoAdministrativo,
  temContextoAluno,
} from '@/lib/contextos-sessao';

export default async function AlunoProtegidoLayout({ children }) {
  const sessao = await getServerSession(authOptions);
  const usuario = sessao?.user;

  if (temContextoAdministrativo(usuario)) {
    return children;
  }

  if (!temContextoAluno(usuario)) {
    redirect('/aluno/login');
  }

  const acessoAtivo = await alunoTemAcessoAtivo(
    usuario.alunoId,
  );

  if (!acessoAtivo) {
    redirect('/aluno/acesso-indisponivel');
  }

  return children;
}
