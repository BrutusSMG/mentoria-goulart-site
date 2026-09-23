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
});
