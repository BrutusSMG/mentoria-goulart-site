/**
 * Estado do convite exibido no painel administrativo.
 *
 * Somente para alunos LEGADO. Não consulta o banco
 * e não envia e-mails.
 */
export function obterEstadoConviteLegado(aluno) {
  if (!aluno || aluno.origem !== 'LEGADO') {
    return null;
  }

  // Um primeiro acesso completo exige senha criada
  // e e-mail verificado.
  if (aluno.senhaHash && aluno.emailVerificadoEm) {
    return 'PRIMEIRO_ACESSO_CONCLUIDO';
  }

  // Dados parciais exigem conferência, em vez de
  // afirmar que o primeiro acesso foi concluído.
  if (aluno.senhaHash || aluno.emailVerificadoEm) {
    return 'CONFERIR';
  }

  if (aluno.conviteLegadoEnviadoEm) {
    return 'ENVIADO';
  }

  return 'PENDENTE';
}
