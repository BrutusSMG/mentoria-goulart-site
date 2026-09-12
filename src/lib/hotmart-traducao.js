// src/lib/hotmart-traducao.js
export const EFEITO_DIREITO_HOTMART = Object.freeze({
  GARANTIR: 'GARANTIR_DIREITO',
  REVOGAR: 'REVOGAR_DIREITO',
  NENHUM: 'NENHUM_EFEITO_DIREITO',
});

const EVENTOS_HOTMART = Object.freeze({
  PURCHASE_BILLET_PRINTED: {
    estadoFinanceiro: 'BILLET_PRINTED',
    efeitoDireito: EFEITO_DIREITO_HOTMART.NENHUM,
    terminalDireito: false,
  },

  PURCHASE_APPROVED: {
    estadoFinanceiro: 'APPROVED',
    efeitoDireito: EFEITO_DIREITO_HOTMART.GARANTIR,
    terminalDireito: false,
  },

  PURCHASE_COMPLETE: {
    estadoFinanceiro: 'COMPLETED',
    efeitoDireito: EFEITO_DIREITO_HOTMART.GARANTIR,
    terminalDireito: false,
  },

  PURCHASE_CANCELED: {
    estadoFinanceiro: 'CANCELED',
    efeitoDireito: EFEITO_DIREITO_HOTMART.NENHUM,
    terminalDireito: false,
  },

  PURCHASE_REFUNDED: {
    estadoFinanceiro: 'REFUNDED',
    efeitoDireito: EFEITO_DIREITO_HOTMART.REVOGAR,
    terminalDireito: true,
  },

  PURCHASE_CHARGEBACK: {
    estadoFinanceiro: 'CHARGEBACK',
    efeitoDireito: EFEITO_DIREITO_HOTMART.REVOGAR,
    terminalDireito: true,
  },
});

export const EVENTOS_TERMINAIS_DIREITO_HOTMART = Object.freeze(
  Object.entries(EVENTOS_HOTMART)
    .filter(([, traducao]) => traducao.terminalDireito)
    .map(([evento]) => evento),
);

export function traduzirEventoHotmart(evento) {
  const traducao = EVENTOS_HOTMART[evento];

  if (!traducao) {
    return {
      conhecido: false,
      estadoFinanceiro: null,
      efeitoDireito: EFEITO_DIREITO_HOTMART.NENHUM,
      terminalDireito: false,
    };
  }

  return {
    conhecido: true,
    ...traducao,
  };
}

export const STATUS_HOTMART_CONFLITO_TEMPORAL = 'CONFLITO_TEMPORAL';

export function decidirConsolidacaoFinanceiraHotmart({
  traducaoEvento,
  hotmartEventId,
  criadoNaHotmartEm,
  transacaoAtual = null,
}) {
  if (!traducaoEvento?.conhecido || !traducaoEvento.estadoFinanceiro) {
    return {
      deveAtualizar: false,
    };
  }

  const novoStatus = traducaoEvento.estadoFinanceiro;
  const novaData = criadoNaHotmartEm || null;

  if (!transacaoAtual) {
    return {
      deveAtualizar: true,
      status: novoStatus,
      ultimoEventoHotmartEm: novaData,
      ultimoEventoHotmartId: hotmartEventId,
    };
  }

  const dataAtual = transacaoAtual.ultimoEventoHotmartEm || null;

  if (dataAtual && !novaData) {
    return {
      deveAtualizar: false,
    };
  }

  if (!dataAtual && novaData) {
    return {
      deveAtualizar: true,
      status: novoStatus,
      ultimoEventoHotmartEm: novaData,
      ultimoEventoHotmartId: hotmartEventId,
    };
  }

  if (!dataAtual && !novaData) {
    if (transacaoAtual.status === novoStatus) {
      return {
        deveAtualizar: false,
      };
    }

    return {
      deveAtualizar: true,
      status: STATUS_HOTMART_CONFLITO_TEMPORAL,
      ultimoEventoHotmartEm: null,
      ultimoEventoHotmartId: null,
    };
  }

  const instanteAtual = dataAtual.getTime();
  const novoInstante = novaData.getTime();

  if (novoInstante > instanteAtual) {
    return {
      deveAtualizar: true,
      status: novoStatus,
      ultimoEventoHotmartEm: novaData,
      ultimoEventoHotmartId: hotmartEventId,
    };
  }

  if (novoInstante < instanteAtual) {
    return {
      deveAtualizar: false,
    };
  }

  if (transacaoAtual.status === novoStatus) {
    return {
      deveAtualizar: false,
    };
  }

  return {
    deveAtualizar: true,
    status: STATUS_HOTMART_CONFLITO_TEMPORAL,
    ultimoEventoHotmartEm: novaData,
    ultimoEventoHotmartId: null,
  };
}