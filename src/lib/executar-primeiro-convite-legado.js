import {
  enviarConvitePrimeiroAcesso,
} from '@/lib/convite-primeiro-acesso';

import {
  prepararPrimeiroConviteLegado,
} from '@/lib/preparar-primeiro-convite-legado';

import {
  registrarResultadoPrimeiroConviteLegado,
} from '@/lib/registrar-resultado-convite-legado';

/**
 * Coordena o primeiro convite legado.
 *
 * O chamador deve verificar a autorização administrativa.
 * A função de envio é substituível nos testes; na aplicação,
 * o padrão é o provedor real.
 *
 * Nunca retorna o token, o e-mail ou o identificador
 * da mensagem ao cliente da API.
 */
export async function executarPrimeiroConviteLegado({
  prisma,
  alunoId,
  enviar = enviarConvitePrimeiroAcesso,
}) {
  // Transação 1: conferir, reservar e criar o token.
  const preparacao = await prisma.$transaction(
    (tx) => prepararPrimeiroConviteLegado(tx, alunoId),
  );

  if (!preparacao.preparado) {
    return {
      estado: 'RECUSADO',
      motivo: preparacao.motivo,
    };
  }

  // A transação de preparação já terminou.
  // A chamada ao provedor acontece fora de qualquer
  // transação do banco.
  let envio;

  try {
    envio = await enviar({
      email: preparacao.aluno.email,
      nome: preparacao.aluno.nome,
      token: preparacao.token,
      detalharResultado: true,
    });
  } catch {
    // Uma exceção não comprova que o provedor deixou
    // de aceitar a mensagem.
    envio = { ok: false, resultado: 'INDETERMINADO' };
  }

  const identificadorValido =
    typeof envio?.mensagemProvedorId === 'string' &&
    Boolean(envio.mensagemProvedorId.trim());

  let resultado = 'INDETERMINADO';

  if (
    envio?.ok === true &&
    envio?.resultado === 'ENVIADO' &&
    identificadorValido
  ) {
    resultado = 'ENVIADO';
  } else if (
    envio?.ok === false &&
    envio?.resultado === 'FALHA'
  ) {
    resultado = 'FALHA';
  }

  // Transação 2: registrar a conclusão da tentativa.
  // Se ela falhar, o envio NÃO será repetido.
  try {
    const registro = await prisma.$transaction(
      (tx) =>
        registrarResultadoPrimeiroConviteLegado(tx, {
          alunoId,
          resultado,
          mensagemProvedorId:
            resultado === 'ENVIADO'
              ? envio.mensagemProvedorId.trim()
              : null,
        }),
    );

    if (!registro.registrado) {
      return {
        estado: 'CONFERIR',
        motivo: 'O resultado do convite exige conferência manual.',
      };
    }
  } catch {
    return {
      estado: 'CONFERIR',
      motivo: 'O resultado do convite exige conferência manual.',
    };
  }

  return { estado: resultado };
}