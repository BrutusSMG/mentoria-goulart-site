import { describe, expect, it } from 'vitest';

import { verificarElegibilidadeConviteLegado } from
  '../src/lib/elegibilidade-convite-legado';

const alunoElegivel = {
  id: 'aluno-ficticio',
  nome: 'Aluno Fictício',
  email: 'legado@example.test',
  origem: 'LEGADO',
  status: 'ATIVO',
  senhaHash: null,
  emailVerificadoEm: null,
  conviteLegadoEnviadoEm: null,
  pessoaId: 'pessoa-ficticia',
  pessoa: {
    id: 'pessoa-ficticia',
    emailPrincipal: 'legado@example.test',
    ativo: true,
  },
};

describe('verificarElegibilidadeConviteLegado', () => {
  it('permite o primeiro convite de um legado elegível', () => {
    expect(
      verificarElegibilidadeConviteLegado(alunoElegivel),
    ).toEqual({
      permitido: true,
      motivo: null,
    });
  });

  it('rejeita conta que não é de aluno legado', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        origem: 'HOTMART',
      }).permitido,
    ).toBe(false);
  });

  it('rejeita aluno inativo', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        status: 'SUSPENSO',
      }).permitido,
    ).toBe(false);
  });

  it('rejeita primeiro acesso já concluído', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        senhaHash: 'hash-ficticio',
        emailVerificadoEm: new Date(),
      }).permitido,
    ).toBe(false);
  });

  it('rejeita convite inicial já enviado', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        conviteLegadoEnviadoEm: new Date(),
      }).permitido,
    ).toBe(false);
  });

  it('rejeita vínculo ausente com Pessoa', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        pessoaId: null,
        pessoa: null,
      }).permitido,
    ).toBe(false);
  });

  it('rejeita Pessoa inativa', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        pessoa: {
          ...alunoElegivel.pessoa,
          ativo: false,
        },
      }).permitido,
    ).toBe(false);
  });

  it('rejeita e-mails incompatíveis', () => {
    expect(
      verificarElegibilidadeConviteLegado({
        ...alunoElegivel,
        pessoa: {
          ...alunoElegivel.pessoa,
          emailPrincipal: 'outra-pessoa@example.test',
        },
      }).permitido,
    ).toBe(false);
  });
});
