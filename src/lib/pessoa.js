import {
  emailFormatoValido,
  normalizarEmail,
} from '@/lib/validacoes';

export async function obterOuCriarPessoa(tx, {
  nome,
  email,
  telefone = null,
}) {
  const emailPrincipal = normalizarEmail(email);
  const nomeNormalizado =
    typeof nome === 'string' ? nome.trim() : '';

  if (!emailFormatoValido(emailPrincipal)) {
    throw new Error('E-mail inválido para identificação da pessoa.');
  }

  if (!nomeNormalizado) {
    throw new Error('Nome obrigatório para identificação da pessoa.');
  }

  return tx.pessoa.upsert({
    where: {
      emailPrincipal,
    },
    update: {},
    create: {
      nome: nomeNormalizado,
      emailPrincipal,
      telefonePrincipal: telefone || null,
    },
  });
}