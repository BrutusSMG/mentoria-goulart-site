import {
  emailValido,
  normalizarEmail,
} from '@/lib/validacoes';

/**
 * Verifica se um administrador pode iniciar o primeiro
 * envio de convite para um aluno legado.
 *
 * Não consulta o banco, não cria token e não envia e-mail.
 *
 * O chamador deverá carregar o Aluno com sua relação Pessoa
 * e verificar separadamente a autorização administrativa.
 */
export function verificarElegibilidadeConviteLegado(aluno) {
  if (!aluno || aluno.origem !== 'LEGADO') {
    return {
      permitido: false,
      motivo: 'Cadastro não identificado como aluno legado.',
    };
  }

  if (aluno.status !== 'ATIVO') {
    return {
      permitido: false,
      motivo: 'A conta do aluno não está ativa.',
    };
  }

  if (aluno.senhaHash || aluno.emailVerificadoEm) {
    return {
      permitido: false,
      motivo: 'O primeiro acesso já foi iniciado ou concluído.',
    };
  }

  if (aluno.conviteLegadoEnviadoEm) {
    return {
      permitido: false,
      motivo: 'O convite inicial já foi enviado.',
    };
  }

  if (
    !aluno.pessoaId ||
    !aluno.pessoa ||
    aluno.pessoa.id !== aluno.pessoaId ||
    aluno.pessoa.ativo !== true
  ) {
    return {
      permitido: false,
      motivo: 'O vínculo com Pessoa exige conferência.',
    };
  }

  const emailAluno = normalizarEmail(aluno.email);
  const emailPessoa = normalizarEmail(
    aluno.pessoa.emailPrincipal,
  );

  if (
    !emailValido(emailAluno) ||
    emailAluno !== emailPessoa
  ) {
    return {
      permitido: false,
      motivo: 'Os e-mails do aluno e da Pessoa são incompatíveis.',
    };
  }

  return { permitido: true, motivo: null };
}
