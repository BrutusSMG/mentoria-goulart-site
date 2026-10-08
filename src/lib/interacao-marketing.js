export const TIPOS_INTERACAO_MARKETING = Object.freeze({
  EBOOK_SOLICITADO: 'EBOOK_SOLICITADO',
  EBOOK_DOWNLOAD: 'EBOOK_DOWNLOAD',
  JORNADA_CONTRIBUICAO: 'JORNADA_CONTRIBUICAO',
});

const TIPOS_VALIDOS = new Set(
  Object.values(TIPOS_INTERACAO_MARKETING),
);

function textoOpcional(valor) {
  const texto = String(valor ?? '').trim();

  return texto || null;
}

/**
 * Registra um fato histórico de marketing.
 *
 * InteracaoMarketing é append-only:
 * este helper somente cria registros.
 *
 * Não altera Lead, Pessoa, Usuario ou qualquer direito.
 */
export async function registrarInteracaoMarketing(
  tx,
  {
    pessoaId,
    tipo,
    origem = null,
    utmSource = null,
    utmMedium = null,
    utmCampaign = null,
    utmTerm = null,
    utmContent = null,
    pagina = null,
  },
) {
  if (!pessoaId) {
    throw new Error(
      'Pessoa é obrigatória para registrar interação de marketing.',
    );
  }

  if (!TIPOS_VALIDOS.has(tipo)) {
    throw new Error(
      'Tipo de interação de marketing inválido.',
    );
  }

  return tx.interacaoMarketing.create({
    data: {
      pessoaId,
      tipo,
      origem: textoOpcional(origem),
      utmSource: textoOpcional(utmSource),
      utmMedium: textoOpcional(utmMedium),
      utmCampaign: textoOpcional(utmCampaign),
      utmTerm: textoOpcional(utmTerm),
      utmContent: textoOpcional(utmContent),
      pagina: textoOpcional(pagina),
    },
  });
}
