import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  ehAdministrador,
  temContextoAdministrativo,
  temContextoAluno,
} from '../src/lib/contextos-sessao';

describe('contextos-sessao', () => {
  it('reconhece contexto de aluno por alunoId', () => {
    expect(
      temContextoAluno({
        alunoId: 'aluno-1',
      }),
    ).toBe(true);

    expect(
      temContextoAluno({
        alunoId: null,
      }),
    ).toBe(false);
  });

  it('reconhece contexto administrativo completo', () => {
    expect(
      temContextoAdministrativo({
        adminUserId: 'admin-1',
        papelAdministrativo: 'PARCEIRO',
      }),
    ).toBe(true);
  });

  it('nao aceita contexto administrativo incompleto', () => {
    expect(
      temContextoAdministrativo({
        adminUserId: 'admin-1',
      }),
    ).toBe(false);

    expect(
      temContextoAdministrativo({
        papelAdministrativo: 'ADMIN',
      }),
    ).toBe(false);
  });

  it('permite aluno e administrativo simultaneamente', () => {
    const usuario = {
      alunoId: 'aluno-1',
      adminUserId: 'admin-1',
      papelAdministrativo: 'PARCEIRO',
    };

    expect(
      temContextoAluno(usuario),
    ).toBe(true);

    expect(
      temContextoAdministrativo(usuario),
    ).toBe(true);
  });

  it('distingue ADMIN de PARCEIRO', () => {
    expect(
      ehAdministrador({
        adminUserId: 'admin-1',
        papelAdministrativo: 'ADMIN',
      }),
    ).toBe(true);

    expect(
      ehAdministrador({
        adminUserId: 'admin-2',
        papelAdministrativo: 'PARCEIRO',
      }),
    ).toBe(false);
  });
});
