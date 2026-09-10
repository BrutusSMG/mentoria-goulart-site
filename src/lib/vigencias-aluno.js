// src/lib/vigencias-aluno.js
import { prisma } from './prisma';
import { obterSituacaoVigencia } from './situacao-vigencia';

export async function listarVigenciasAluno(
  alunoId,
  agora = new Date(),
  db = prisma,
) {
  const id = String(alunoId || '').trim();

  if (!id) {
    return [];
  }

  const matriculas = await db.matricula.findMany({
    where: {
      alunoId: id,
    },

    select: {
      id: true,
      produtoId: true,
      produtoNome: true,
      status: true,

      vigencias: {
        select: {
          id: true,
          status: true,
          tipoDuracao: true,
          iniciaEm: true,
          expiraEm: true,
        },

        orderBy: [
          {
            iniciaEm: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return matriculas.flatMap((matricula) =>
    matricula.vigencias.map((vigencia) => ({
      id: vigencia.id,
      matriculaId: matricula.id,
      produtoId: matricula.produtoId,
      produtoNome: matricula.produtoNome,
      matriculaStatus: matricula.status,
      status: vigencia.status,
      situacao:
        matricula.status === 'SUSPENSA'
          ? 'SUSPENSA'
          : matricula.status === 'CANCELADA'
            ? 'CANCELADA'
            : matricula.status === 'ENCERRADA'
              ? 'ENCERRADA'
              : matricula.status === 'PENDENTE'
                ? 'PENDENTE'
                : obterSituacaoVigencia(vigencia, agora),
      tipoDuracao: vigencia.tipoDuracao,
      iniciaEm: vigencia.iniciaEm,
      expiraEm: vigencia.expiraEm,
    })),
  );
}
