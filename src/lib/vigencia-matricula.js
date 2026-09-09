export function adicionarDias(data, dias) {
  const resultado = new Date(data);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

export function adicionarAnosCalendario(data, anos) {
  const resultado = new Date(data);
  const mesOriginal = resultado.getUTCMonth();

  resultado.setUTCFullYear(resultado.getUTCFullYear() + anos);

  // Ex.: 29/02 + 1 ano deve resultar no último dia de fevereiro,
  // e não avançar automaticamente para março.
  if (resultado.getUTCMonth() !== mesOriginal) {
    resultado.setUTCDate(0);
  }

  return resultado;
}

export function calcularVigenciaInicialMgu(aprovadoEm) {
  if (!(aprovadoEm instanceof Date) || Number.isNaN(aprovadoEm.getTime())) {
    throw new TypeError('Data de aprovação inválida.');
  }

  const concedidaEm = new Date(aprovadoEm);
  const iniciaEm = new Date(aprovadoEm);
  const garantiaAte = adicionarDias(aprovadoEm, 7);
  const expiraEm = adicionarDias(
    adicionarAnosCalendario(aprovadoEm, 1),
    7,
  );

  return {
    concedidaEm,
    iniciaEm,
    garantiaAte,
    expiraEm,
  };
}

export async function provisionarPrimeiraVigenciaHotmart(
  tx,
  {
    matriculaId,
    transacaoOrigemId,
    aprovadoEm,
  },
) {
  const vigenciaDaTransacao = await tx.vigenciaMatricula.findUnique({
    where: {
      transacaoOrigemId,
    },
    select: {
      id: true,
    },
  });

  if (vigenciaDaTransacao) {
    return vigenciaDaTransacao;
  }

  const vigenciaExistente = await tx.vigenciaMatricula.findFirst({
    where: {
      matriculaId,
    },
    select: {
      id: true,
    },
  });

  // E1.4 cria somente a primeira vigência.
  // Renovações/recompras serão tratadas com regra própria na E1.9.
  if (vigenciaExistente) {
    return null;
  }

  const periodo = calcularVigenciaInicialMgu(aprovadoEm);

  return tx.vigenciaMatricula.create({
    data: {
      matriculaId,
      transacaoOrigemId,
      origem: 'HOTMART',
      tipoDuracao: 'DEFINIDA',
      status: 'ATIVA',
      concedidaEm: periodo.concedidaEm,
      iniciaEm: periodo.iniciaEm,
      garantiaAte: periodo.garantiaAte,
      expiraEm: periodo.expiraEm,
      statusAlteradoEm: periodo.iniciaEm,
    },
    select: {
      id: true,
    },
  });
}