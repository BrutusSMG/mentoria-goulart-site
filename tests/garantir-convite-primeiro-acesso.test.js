import { describe, expect, it, vi } from 'vitest';

import {
  garantirConvitePrimeiroAcesso,
} from '../src/lib/provisionar-aluno';
import {
  hashTokenAcesso,
} from '../src/lib/convite-primeiro-acesso';

describe('garantirConvitePrimeiroAcesso', () => {
  const agora = new Date('2026-09-16T12:00:00.000Z');

  function criarTx() {
    return {
      alunoAccessToken: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };
  }

  it('não cria convite quando a conta já possui senha', async () => {
    const tx = criarTx();

    const resultado = await garantirConvitePrimeiroAcesso(
      tx,
      {
        id: 'aluno-com-senha',
        status: 'ATIVO',
        senhaHash: 'hash-existente',
      },
      agora,
    );

    expect(resultado).toEqual({
      conviteToken: null,
      conviteNovo: false,
    });

    expect(
      tx.alunoAccessToken.findFirst,
    ).not.toHaveBeenCalled();

    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('não cria convite para conta que não esteja ativa', async () => {
    const tx = criarTx();

    const resultado = await garantirConvitePrimeiroAcesso(
      tx,
      {
        id: 'aluno-inativo',
        status: 'INATIVO',
        senhaHash: null,
      },
      agora,
    );

    expect(resultado).toEqual({
      conviteToken: null,
      conviteNovo: false,
    });

    expect(
      tx.alunoAccessToken.findFirst,
    ).not.toHaveBeenCalled();

    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('reutiliza estado quando já existe convite válido', async () => {
    const tx = criarTx();

    tx.alunoAccessToken.findFirst.mockResolvedValue({
      id: 'convite-existente',
    });

    const resultado = await garantirConvitePrimeiroAcesso(
      tx,
      {
        id: 'aluno-1',
        status: 'ATIVO',
        senhaHash: null,
      },
      agora,
    );

    expect(resultado).toEqual({
      conviteToken: null,
      conviteNovo: false,
    });

    expect(
      tx.alunoAccessToken.findFirst,
    ).toHaveBeenCalledWith({
      where: {
        alunoId: 'aluno-1',
        tipo: 'PRIMEIRO_ACESSO',
        usadoEm: null,
        expiraEm: {
          gt: agora,
        },
      },
      select: {
        id: true,
      },
    });

    expect(
      tx.alunoAccessToken.create,
    ).not.toHaveBeenCalled();
  });

  it('cria convite para conta ativa sem senha e sem token válido', async () => {
    const tx = criarTx();

    tx.alunoAccessToken.findFirst.mockResolvedValue(null);
    tx.alunoAccessToken.create.mockResolvedValue({
      id: 'convite-novo',
    });

    const resultado = await garantirConvitePrimeiroAcesso(
      tx,
      {
        id: 'aluno-ebook',
        status: 'ATIVO',
        senhaHash: null,
      },
      agora,
    );

    expect(resultado.conviteNovo).toBe(true);
    expect(resultado.conviteToken).toMatch(
      /^[a-f0-9]{64}$/,
    );

    expect(
      tx.alunoAccessToken.create,
    ).toHaveBeenCalledWith({
      data: {
        alunoId: 'aluno-ebook',
        tokenHash: hashTokenAcesso(
          resultado.conviteToken,
        ),
        tipo: 'PRIMEIRO_ACESSO',
        expiraEm: new Date(
          '2026-09-19T12:00:00.000Z',
        ),
      },
    });
  });
});
