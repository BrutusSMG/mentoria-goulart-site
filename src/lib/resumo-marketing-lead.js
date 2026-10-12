function possuiAtribuicao(interacao) {
  return Boolean(
    interacao?.origem ||
    interacao?.utmSource ||
    interacao?.utmMedium ||
    interacao?.utmCampaign ||
    interacao?.utmTerm ||
    interacao?.utmContent
  );
}

function resumirInteracao(interacao) {
  if (!interacao) return null;

  return {
    tipo: interacao.tipo,
    origem: interacao.origem || null,
    utmSource: interacao.utmSource || null,
    utmMedium: interacao.utmMedium || null,
    utmCampaign: interacao.utmCampaign || null,
    utmTerm: interacao.utmTerm || null,
    utmContent: interacao.utmContent || null,
    pagina: interacao.pagina || null,
    createdAt: interacao.createdAt,
  };
}

export function resumirMarketingLead(
  interacoes = [],
) {
  if (!Array.isArray(interacoes) || interacoes.length === 0) {
    return {
      historicoDisponivel: false,
      totalInteracoes: 0,
      primeiraAtribuicao: null,
      ultimaAtribuicao: null,
      ultimaInteracao: null,
    };
  }

  const ordenadas = [...interacoes].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );

  const atribuicoes =
    ordenadas.filter(possuiAtribuicao);

  return {
    historicoDisponivel: true,
    totalInteracoes: ordenadas.length,
    primeiraAtribuicao:
      resumirInteracao(atribuicoes[0]),
    ultimaAtribuicao:
      resumirInteracao(
        atribuicoes[atribuicoes.length - 1],
      ),
    ultimaInteracao:
      resumirInteracao(
        ordenadas[ordenadas.length - 1],
      ),
  };
}
