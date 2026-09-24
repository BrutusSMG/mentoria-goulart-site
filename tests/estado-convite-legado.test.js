import { describe, expect, it } from 'vitest';

import { obterEstadoConviteLegado } from
  '../src/lib/estado-convite-legado';

const legado = {
  origem: 'LEGADO',
  senhaHash: null,
  emailVerificadoEm: null,
  conviteLegadoEnviadoEm: null,
};

describe('obterEstadoConviteLegado', () => {
  it('identifica convite pendente', () => {
    expect(
      obterEstadoConviteLegado(legado),
    ).toBe('PENDENTE');
  });

  it('identifica envio confirmado pelo serviço', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        conviteLegadoEnviadoEm: new Date(),
      }),
    ).toBe('ENVIADO');
  });

  it('identifica primeiro acesso concluído', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: new Date(),
      }),
    ).toBe('PRIMEIRO_ACESSO_CONCLUIDO');
  });

  it('não confunde dados parciais com acesso concluído', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        emailVerificadoEm: new Date(),
      }),
    ).toBe('CONFERIR');
  });

  it('não classifica convites de novos compradores', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        origem: 'HOTMART',
      }),
    ).toBeNull();
  });

  it('identifica controle de convite em andamento', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        controleConviteLegado: {
          status: 'EM_ANDAMENTO',
        },
      }),
    ).toBe('EM_ANDAMENTO');
  });

  it('identifica falha registrada no controle', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        controleConviteLegado: {
          status: 'FALHA',
        },
      }),
    ).toBe('FALHA');
  });

  it('identifica resultado indeterminado', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        controleConviteLegado: {
          status: 'INDETERMINADO',
        },
      }),
    ).toBe('INDETERMINADO');
  });

  it('mantém PENDENTE quando o controle ainda não foi reservado', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        controleConviteLegado: {
          status: 'PENDENTE',
        },
      }),
    ).toBe('PENDENTE');
  });

  it('exige conferência quando o controle indica envio sem data no aluno', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        controleConviteLegado: {
          status: 'ENVIADO',
        },
      }),
    ).toBe('CONFERIR');
  });

  it('exige conferência quando existe data de envio mas o controle indica falha', () => {
    expect(
      obterEstadoConviteLegado({
        ...legado,
        conviteLegadoEnviadoEm: new Date(),
        controleConviteLegado: {
          status: 'FALHA',
        },
      }),
    ).toBe('CONFERIR');
  });
});
