import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  registrarInteracaoMarketing,
  TIPOS_INTERACAO_MARKETING,
} from '../src/lib/interacao-marketing';

function criarTx() {
  return {
    interacaoMarketing: {
      create: vi.fn().mockImplementation(
        async ({ data }) => ({
          id: 'interacao-1',
          ...data,
        }),
      ),
    },
  };
}

describe('registrarInteracaoMarketing', () => {
  it('registra uma solicitação de e-book com atribuição completa', async () => {
    const tx = criarTx();

    const resultado =
      await registrarInteracaoMarketing(
        tx,
        {
          pessoaId: 'pessoa-1',
          tipo:
            TIPOS_INTERACAO_MARKETING
              .EBOOK_SOLICITADO,
          origem: 'Isca Digital - Ebook',
          utmSource: 'instagram',
          utmMedium: 'social',
          utmCampaign: 'campanha-e6',
          utmTerm: 'garimpo urbano',
          utmContent: 'criativo-1',
          pagina: '/',
        },
      );

    expect(
      tx.interacaoMarketing.create,
    ).toHaveBeenCalledWith({
      data: {
        pessoaId: 'pessoa-1',
        tipo: 'EBOOK_SOLICITADO',
        origem: 'Isca Digital - Ebook',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'campanha-e6',
        utmTerm: 'garimpo urbano',
        utmContent: 'criativo-1',
        pagina: '/',
      },
    });

    expect(resultado.tipo).toBe(
      'EBOOK_SOLICITADO',
    );
  });

  it('normaliza campos opcionais vazios para null', async () => {
    const tx = criarTx();

    await registrarInteracaoMarketing(
      tx,
      {
        pessoaId: 'pessoa-1',
        tipo:
          TIPOS_INTERACAO_MARKETING
            .EBOOK_DOWNLOAD,
        origem: '   ',
        utmSource: '',
      },
    );

    expect(
      tx.interacaoMarketing.create,
    ).toHaveBeenCalledWith({
      data: {
        pessoaId: 'pessoa-1',
        tipo: 'EBOOK_DOWNLOAD',
        origem: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        pagina: null,
      },
    });
  });

  it('registra contribuição da Jornada como evento próprio', async () => {
    const tx = criarTx();

    await registrarInteracaoMarketing(
      tx,
      {
        pessoaId: 'pessoa-2',
        tipo:
          TIPOS_INTERACAO_MARKETING
            .JORNADA_CONTRIBUICAO,
        origem: 'Jornada do Aluno',
        pagina: '/jornada-do-aluno',
      },
    );

    expect(
      tx.interacaoMarketing.create,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pessoaId: 'pessoa-2',
        tipo: 'JORNADA_CONTRIBUICAO',
        origem: 'Jornada do Aluno',
        pagina: '/jornada-do-aluno',
      }),
    });
  });

  it('rejeita interação sem Pessoa', async () => {
    const tx = criarTx();

    await expect(
      registrarInteracaoMarketing(
        tx,
        {
          pessoaId: null,
          tipo:
            TIPOS_INTERACAO_MARKETING
              .EBOOK_SOLICITADO,
        },
      ),
    ).rejects.toThrow(
      'Pessoa é obrigatória',
    );

    expect(
      tx.interacaoMarketing.create,
    ).not.toHaveBeenCalled();
  });

  it('rejeita tipo fora da taxonomia aprovada', async () => {
    const tx = criarTx();

    await expect(
      registrarInteracaoMarketing(
        tx,
        {
          pessoaId: 'pessoa-1',
          tipo: 'EVENTO_INVENTADO',
        },
      ),
    ).rejects.toThrow(
      'Tipo de interação de marketing inválido.',
    );

    expect(
      tx.interacaoMarketing.create,
    ).not.toHaveBeenCalled();
  });
});
