// src/app/api/alunos/minhas-vigencias/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { listarVigenciasAluno } from '@/lib/vigencias-aluno';

export const dynamic = 'force-dynamic';

function resposta(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (
    session?.user?.tipoConta !== 'ALUNO' ||
    !session?.user?.alunoId
  ) {
    return resposta(
      {
        ok: false,
        erro: 'Acesso não autorizado.',
      },
      401,
    );
  }

  try {
    const vigencias = await listarVigenciasAluno(
      session.user.alunoId,
    );

    return resposta({
      ok: true,
      vigencias,
    });
  } catch (error) {
    console.error(
      '[ALUNO][MINHAS_VIGENCIAS]',
      error?.message || error,
    );

    return resposta(
      {
        ok: false,
        erro: 'Não foi possível carregar suas vigências.',
      },
      500,
    );
  }
}
