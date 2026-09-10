// src/lib/situacao-vigencia.js

export function obterSituacaoVigencia(
  vigencia,
  agora = new Date(),
) {
  if (!vigencia) {
    return 'INDEFINIDA';
  }

  if (vigencia.status === 'SUSPENSA') {
    return 'SUSPENSA';
  }

  if (vigencia.status === 'CANCELADA') {
    return 'CANCELADA';
  }

  if (vigencia.status === 'ENCERRADA') {
    return 'ENCERRADA';
  }

  if (
    vigencia.iniciaEm instanceof Date &&
    vigencia.iniciaEm > agora
  ) {
    return 'AGENDADA';
  }

  if (
    vigencia.expiraEm instanceof Date &&
    agora >= vigencia.expiraEm
  ) {
    return 'EXPIRADA';
  }

  if (
    ['AGENDADA', 'ATIVA'].includes(vigencia.status) &&
    vigencia.iniciaEm instanceof Date &&
    vigencia.iniciaEm <= agora
  ) {
    return 'ATIVA';
  }

  return 'INDEFINIDA';
}
