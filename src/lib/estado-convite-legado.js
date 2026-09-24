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

  const statusControle =
    aluno.controleConviteLegado?.status;

  // A data de envio e o controle precisam ser coerentes.
  if (aluno.conviteLegadoEnviadoEm) {
    if (
      statusControle &&
      statusControle !== 'ENVIADO'
    ) {
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

  if (
    statusControle &&
    statusControle !== 'PENDENTE'
  ) {
    return 'CONFERIR';
  }

  // Mantém compatibilidade com cadastros antigos
  // que ainda não possuem o controle carregado.
  return 'PENDENTE';
}
