/**
 * Estado do convite exibido no painel administrativo.
 *
 * Somente para alunos LEGADO.
 * Não consulta o banco e não envia e-mails.
 *
 * Quando disponível, o chamador deve carregar também
 * a relação controleConviteLegado do aluno.
 */
export function obterEstadoConviteLegado(aluno) {
  if (!aluno || aluno.origem !== 'LEGADO') {
    return null;
  }

  // Primeiro acesso concluído: senha criada e
  // e-mail verificado.
  if (aluno.senhaHash && aluno.emailVerificadoEm) {
    return 'PRIMEIRO_ACESSO_CONCLUIDO';
  }

  // Dados parciais não permitem afirmar que
  // o primeiro acesso foi concluído.
  if (aluno.senhaHash || aluno.emailVerificadoEm) {
    return 'CONFERIR';
  }

  // Sem controle registrado, não há como confirmar
  // que o convite está realmente pendente de envio.
  if (!aluno.controleConviteLegado) {
    return 'CONFERIR';
  }

  const statusControle =
    aluno.controleConviteLegado.status;

   // A data de envio e o controle precisam ser coerentes.
  if (aluno.conviteLegadoEnviadoEm) {
    if (statusControle !== 'ENVIADO') {
      return 'CONFERIR';
    }

    return 'ENVIADO';
  }

  // O controle afirma que houve envio, mas falta
  // a data correspondente no cadastro do aluno.
  if (statusControle === 'ENVIADO') {
    return 'CONFERIR';
  }

  if (
    statusControle === 'EM_ANDAMENTO' ||
    statusControle === 'FALHA' ||
    statusControle === 'INDETERMINADO'
  ) {
    return statusControle;
  }

  if (statusControle === 'PENDENTE') {
    return 'PENDENTE';
  }

  // Inclui estados desconhecidos ou ausentes.
  return 'CONFERIR';
}
