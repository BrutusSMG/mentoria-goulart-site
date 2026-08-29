// src/app/(admin)/admin/jornada/layout.jsx
import { redirect } from 'next/navigation';
import { obterAcessoModulo } from '@/lib/admin-permissoes';

export default async function JornadaAdminLayout({ children }) {
  const acesso = await obterAcessoModulo('JORNADA');

  if (!acesso.permitido) {
    if (acesso.status === 401) redirect('/login');
    redirect('/admin?erro=sem-permissao');
  }

  return children;
}