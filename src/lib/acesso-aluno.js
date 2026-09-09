// src/lib/acesso-aluno.js
import { prisma } from './prisma';

export function vigenciaPermiteAcesso(vigencia, agora = new Date()) {
  if (!vigencia) return false;

  if (!['AGENDADA', 'ATIVA'].includes(vigencia.status)) {
    return false;
  }

  if (!(vigencia.iniciaEm instanceof Date) || vigencia.iniciaEm > agora) {
    return false;
  }

  if (vigencia.expiraEm instanceof Date && agora >= vigencia.expiraEm) {
    return false;
  }

  return true;
}

export async function alunoTemAcessoAtivo(
  alunoId,
  agora = new Date(),
  db = prisma,
) {
  const id = String(alunoId || '').trim();

  if (!id) {
    return false;
  }

  const aluno = await db.aluno.findFirst({
    where: {
      id,
      status: 'ATIVO',

      matriculas: {
        some: {
          status: 'ATIVA',

          vigencias: {
            some: {
              status: {
                in: ['AGENDADA', 'ATIVA'],
              },

              iniciaEm: {
                lte: agora,
              },

              OR: [
                {
                  expiraEm: null,
                },
                {
                  expiraEm: {
                    gt: agora,
                  },
                },
              ],
            },
          },
        },
      },
    },

    select: {
      id: true,
    },
  });

  return Boolean(aluno);
}