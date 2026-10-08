import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  resumirMarketingLead,
} from '../src/lib/resumo-marketing-lead';

describe('resumirMarketingLead', () => {
  it('separa primeira e última atribuição da última interação', () => {
    const resultado = resumirMarketingLead([
      {
        tipo: 'EBOOK_DOWNLOAD',
        origem: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        pagina: '/api/ebook',
        createdAt:
          new Date('2026-10-08T13:00:00Z'),
      },
      {
        tipo: 'EBOOK_SOLICITADO',
        origem: 'Anúncio Ebook',
        utmSource: 'instagram',
        utmMedium: 'social',
        utmCampaign: 'segunda-campanha',
        utmTerm: null,
        utmContent: null,
        pagina: null,
        createdAt:
          new Date('2026-10-08T12:00:00Z'),
      },
      {
        tipo: 'EBOOK_SOLICITADO',
        origem: 'Página principal',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'primeira-campanha',
        utmTerm: null,
        utmContent: null,
        pagina: null,
        createdAt:
          new Date('2026-10-08T10:00:00Z'),
      },
    ]);

    expect(resultado.historicoDisponivel).toBe(
      true,
    );

    expect(resultado.totalInteracoes).toBe(3);

    expect(
      resultado.primeiraAtribuicao.utmSource,
    ).toBe('google');

    expect(
      resultado.ultimaAtribuicao.utmSource,
    ).toBe('instagram');

    expect(
      resultado.ultimaInteracao.tipo,
    ).toBe('EBOOK_DOWNLOAD');
  });

  it('não transforma download sem atribuição em última origem', () => {
    const resultado = resumirMarketingLead([
      {
        tipo: 'EBOOK_SOLICITADO',
        origem: 'Isca Digital - Ebook',
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        pagina: null,
        createdAt:
          new Date('2026-10-08T10:00:00Z'),
      },
      {
        tipo: 'EBOOK_DOWNLOAD',
        origem: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        pagina: '/api/ebook',
        createdAt:
          new Date('2026-10-08T11:00:00Z'),
      },
    ]);

    expect(
      resultado.ultimaAtribuicao.origem,
    ).toBe('Isca Digital - Ebook');

    expect(
      resultado.ultimaInteracao.tipo,
    ).toBe('EBOOK_DOWNLOAD');
  });

  it('representa histórico existente sem atribuição conhecida', () => {
    const resultado = resumirMarketingLead([
      {
        tipo: 'EBOOK_DOWNLOAD',
        origem: null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        pagina: '/api/ebook',
        createdAt:
          new Date('2026-10-08T11:00:00Z'),
      },
    ]);

    expect(resultado.historicoDisponivel).toBe(
      true,
    );

    expect(resultado.totalInteracoes).toBe(1);

    expect(
      resultado.primeiraAtribuicao,
    ).toBeNull();

    expect(
      resultado.ultimaAtribuicao,
    ).toBeNull();

    expect(
      resultado.ultimaInteracao.tipo,
    ).toBe('EBOOK_DOWNLOAD');
  });

  it('não inventa histórico para Lead legado', () => {
    expect(
      resumirMarketingLead([]),
    ).toEqual({
      historicoDisponivel: false,
      totalInteracoes: 0,
      primeiraAtribuicao: null,
      ultimaAtribuicao: null,
      ultimaInteracao: null,
    });
  });
});
