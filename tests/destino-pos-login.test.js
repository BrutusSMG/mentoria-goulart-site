import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  destinoInicialDoUsuario,
  destinosDoUsuario,
} from '../src/lib/destino-pos-login';

describe('destino-pos-login', () => {
  it('envia aluno puro para o Portal', () => {
    expect(
      destinoInicialDoUsuario({
        alunoId: 'aluno-1',
      }),
    ).toBe('/aluno');
  });

  it('envia ADMIN canonico para o painel administrativo', () => {
    expect(
      destinoInicialDoUsuario({
        adminUserId: 'admin-1',
        papelAdministrativo: 'ADMIN',
      }),
    ).toBe('/admin');
  });

  it('prioriza contexto administrativo quando aluno e admin coexistem', () => {
    expect(
      destinoInicialDoUsuario({
        alunoId: 'aluno-1',
        adminUserId: 'admin-1',
        papelAdministrativo: 'ADMIN',
      }),
    ).toBe('/admin');
  });

  it('envia PARCEIRO com um unico modulo diretamente para ele', () => {
    expect(
      destinoInicialDoUsuario({
        adminUserId: 'admin-1',
        papelAdministrativo: 'PARCEIRO',
        podeGerenciarSucatas: true,
      }),
    ).toBe('/admin/sucatas');
  });

  it('envia PARCEIRO com varios ou nenhum modulo para a selecao', () => {
    expect(
      destinoInicialDoUsuario({
        adminUserId: 'admin-1',
        papelAdministrativo: 'PARCEIRO',
        podeGerenciarSucatas: true,
        podeGerenciarJornada: true,
      }),
    ).toBe('/admin/modulos');

    expect(
      destinoInicialDoUsuario({
        adminUserId: 'admin-1',
        papelAdministrativo: 'PARCEIRO',
      }),
    ).toBe('/admin/modulos');
  });

  it('nao trata role isolado como contexto administrativo', () => {
    expect(
      destinoInicialDoUsuario({
        role: 'ADMIN',
      }),
    ).toBe('/login');

    expect(
      destinosDoUsuario({
        role: 'ADMIN',
      }),
    ).toEqual([]);
  });
});
