import { describe, expect, it, vi } from 'vitest';

import {
  alunoTemAcessoAtivo,
  vigenciaPermiteAcesso,
} from '../src/lib/acesso-aluno';

describe('vigenciaPermiteAcesso', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  it('nega acesso quando não há vigência', () => {
    expect(vigenciaPermiteAcesso(null, agora)).toBe(false);
  });

  it('nega acesso para vigência suspensa', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'SUSPENSA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: new Date('2027-09-01T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega acesso para vigência cancelada', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'CANCELADA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega acesso para vigência encerrada', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'ENCERRADA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega acesso para vigência que ainda não iniciou', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'AGENDADA',
          iniciaEm: new Date('2026-09-10T12:00:00.000Z'),
          expiraEm: new Date('2027-09-10T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(false);
  });

  it('permite AGENDADA cuja data de início já chegou', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'AGENDADA',
          iniciaEm: new Date('2026-09-09T12:00:00.000Z'),
          expiraEm: new Date('2027-09-09T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(true);
  });

  it('permite ATIVA dentro do período', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'ATIVA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: new Date('2027-09-01T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(true);
  });

  it('nega acesso para vigência ATIVA já expirada', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'ATIVA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: new Date('2026-09-08T12:00:00.000Z'),
        },
        agora,
      ),
    ).toBe(false);
  });

  it('nega acesso exatamente no instante da expiração', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'ATIVA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: agora,
        },
        agora,
      ),
    ).toBe(false);
  });

  it('permite vigência sem expiração definida', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          status: 'ATIVA',
          iniciaEm: new Date('2026-09-01T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(true);
  });

  it('permite acesso para aluno legado com vigência sem vencimento definido', () => {
    expect(
      vigenciaPermiteAcesso(
        {
          origem: 'LEGADO',
          tipoDuracao: 'INDEFINIDA',
          status: 'ATIVA',
          iniciaEm: new Date('2020-01-01T12:00:00.000Z'),
          expiraEm: null,
        },
        agora,
      ),
    ).toBe(true);
  });
});

describe('alunoTemAcessoAtivo', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  it('nega acesso sem alunoId sem consultar o banco', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn(),
      },
    };

    await expect(
      alunoTemAcessoAtivo('', agora, db),
    ).resolves.toBe(false);

    expect(db.aluno.findFirst).not.toHaveBeenCalled();
  });

  it('retorna true quando o banco encontra aluno com acesso válido', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'aluno-1',
        }),
      },
    };

    await expect(
      alunoTemAcessoAtivo('aluno-1', agora, db),
    ).resolves.toBe(true);

    expect(db.aluno.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'aluno-1',
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
  });

  it('retorna false quando nenhuma combinação válida é encontrada', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(
      alunoTemAcessoAtivo('aluno-1', agora, db),
    ).resolves.toBe(false);
  });

  it('nega acesso para aluno sem matrícula', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(
      alunoTemAcessoAtivo('aluno-sem-matricula', agora, db),
    ).resolves.toBe(false);

    expect(db.aluno.findFirst).toHaveBeenCalledTimes(1);
  });

  it('nega acesso para matrícula sem vigência', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(
      alunoTemAcessoAtivo('aluno-sem-vigencia', agora, db),
    ).resolves.toBe(false);

    expect(db.aluno.findFirst).toHaveBeenCalledTimes(1);
  });

  it('permite acesso para aluno manual sem transação Hotmart', async () => {
    const db = {
      aluno: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'aluno-manual',
        }),
      },
    };

    await expect(
      alunoTemAcessoAtivo('aluno-manual', agora, db),
    ).resolves.toBe(true);

    expect(db.aluno.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'aluno-manual',
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
  });
});