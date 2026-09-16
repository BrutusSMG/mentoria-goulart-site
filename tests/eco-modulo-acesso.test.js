import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  alunoPodeAcessarEcoModulo,
  alunoPodeAcessarEcoRecurso,
  nivelEcossistemaPermite,
} from '../src/lib/direitos-produto';

const AGORA = new Date('2026-09-15T21:00:00.000Z');

function criarDbComNivel(nivel) {
  return {
    direitoConcedido: {
      findMany: vi.fn().mockResolvedValue(
        nivel === 'NENHUM'
          ? []
          : [
              {
                produtoDireito: {
                  nivel,
                },
              },
            ],
      ),
    },
    ecoModulo: {
      findUnique: vi.fn(),
    },
    ecoModuloRecurso: {
      findFirst: vi.fn(),
    },
  };
}

describe('acesso cumulativo ao EcoMGU', () => {
  it('aplica a hierarquia BASICO, COMPLETO e PREMIUM', () => {
    expect(
      nivelEcossistemaPermite('BASICO', 'BASICO'),
    ).toBe(true);

    expect(
      nivelEcossistemaPermite('BASICO', 'COMPLETO'),
    ).toBe(false);

    expect(
      nivelEcossistemaPermite('COMPLETO', 'BASICO'),
    ).toBe(true);

    expect(
      nivelEcossistemaPermite('COMPLETO', 'COMPLETO'),
    ).toBe(true);

    expect(
      nivelEcossistemaPermite('COMPLETO', 'PREMIUM'),
    ).toBe(false);

    expect(
      nivelEcossistemaPermite('PREMIUM', 'BASICO'),
    ).toBe(true);

    expect(
      nivelEcossistemaPermite('PREMIUM', 'COMPLETO'),
    ).toBe(true);

    expect(
      nivelEcossistemaPermite('PREMIUM', 'PREMIUM'),
    ).toBe(true);
  });

  it('nega NENHUM ou configuracao de nivel minimo invalida', () => {
    expect(
      nivelEcossistemaPermite('NENHUM', 'BASICO'),
    ).toBe(false);

    expect(
      nivelEcossistemaPermite('PREMIUM', 'NENHUM'),
    ).toBe(false);

    expect(
      nivelEcossistemaPermite('PREMIUM', 'INVALIDO'),
    ).toBe(false);
  });

  it('permite modulo BASICO para aluno COMPLETO', async () => {
    const db = criarDbComNivel('COMPLETO');

    db.ecoModulo.findUnique.mockResolvedValue({
      ativo: true,
      nivelMinimo: 'BASICO',
    });

    await expect(
      alunoPodeAcessarEcoModulo(
        'aluno-1',
        'modulo-basico',
        AGORA,
        db,
      ),
    ).resolves.toBe(true);
  });

  it('nega modulo PREMIUM para aluno COMPLETO', async () => {
    const db = criarDbComNivel('COMPLETO');

    db.ecoModulo.findUnique.mockResolvedValue({
      ativo: true,
      nivelMinimo: 'PREMIUM',
    });

    await expect(
      alunoPodeAcessarEcoModulo(
        'aluno-1',
        'modulo-premium',
        AGORA,
        db,
      ),
    ).resolves.toBe(false);
  });

  it('nega modulo inativo sem consultar direitos', async () => {
    const db = criarDbComNivel('PREMIUM');

    db.ecoModulo.findUnique.mockResolvedValue({
      ativo: false,
      nivelMinimo: 'BASICO',
    });

    await expect(
      alunoPodeAcessarEcoModulo(
        'aluno-1',
        'modulo-inativo',
        AGORA,
        db,
      ),
    ).resolves.toBe(false);

    expect(
      db.direitoConcedido.findMany,
    ).not.toHaveBeenCalled();
  });

  it('permite recurso quando o nivel cobre modulo e recurso', async () => {
    const db = criarDbComNivel('PREMIUM');

    db.ecoModuloRecurso.findFirst.mockResolvedValue({
      nivelMinimo: 'COMPLETO',
      modulo: {
        nivelMinimo: 'BASICO',
      },
    });

    await expect(
      alunoPodeAcessarEcoRecurso(
        'aluno-1',
        'modulo-1',
        'recurso-1',
        AGORA,
        db,
      ),
    ).resolves.toBe(true);
  });

  it('usa o nivel do modulo quando ele e mais restritivo', async () => {
    const db = criarDbComNivel('BASICO');

    db.ecoModuloRecurso.findFirst.mockResolvedValue({
      nivelMinimo: 'BASICO',
      modulo: {
        nivelMinimo: 'COMPLETO',
      },
    });

    await expect(
      alunoPodeAcessarEcoRecurso(
        'aluno-1',
        'modulo-1',
        'recurso-1',
        AGORA,
        db,
      ),
    ).resolves.toBe(false);
  });

  it('nega recurso inexistente ou inativo sem consultar direitos', async () => {
    const db = criarDbComNivel('PREMIUM');

    db.ecoModuloRecurso.findFirst.mockResolvedValue(null);

    await expect(
      alunoPodeAcessarEcoRecurso(
        'aluno-1',
        'modulo-1',
        'recurso-inativo',
        AGORA,
        db,
      ),
    ).resolves.toBe(false);

    expect(
      db.direitoConcedido.findMany,
    ).not.toHaveBeenCalled();
  });
});
