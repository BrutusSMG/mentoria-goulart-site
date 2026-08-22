export const STATUS_VINCULO = [
  'AUTODECLARADO',
  'PENDENTE_VERIFICACAO',
  'ALUNO_CONFIRMADO',
  'DIVERGENCIA',
  'NAO_LOCALIZADO',
];

export const STATUS_OPERACIONAL = [
  'NOVA_RESPOSTA',
  'EM_ANALISE',
  'AGUARDANDO_CONTATO',
  'ENTREVISTA_AGENDADA',
  'EM_PRODUCAO',
  'ENCAMINHADA_PRODUTO',
  'CONCLUIDA',
  'ARQUIVADA',
];

export const TAGS_JORNADA = [
  'DEPOIMENTO',
  'CASE',
  'MELHORIA',
  'NOVO_CONTEUDO',
  'PARCERIA',
];

export function paginaSegura(valor, padrao = 1) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : padrao;
}

export function tamanhoPaginaSegura(valor, padrao = 25) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) return padrao;
  return Math.min(numero, 100);
}
