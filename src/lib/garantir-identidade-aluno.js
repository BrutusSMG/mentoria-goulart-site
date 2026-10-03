// src/lib/garantir-identidade-aluno.js

function normalizarEmail(valor) {
  return String(valor || '').trim().toLowerCase();
}

export async function garantirIdentidadeAluno(
  tx,
  aluno,
) {
  const email = normalizarEmail(aluno?.email);

  if (!aluno?.id || !email) {
    throw new Error(
      'Aluno invalido para consolidacao de identidade.',
    );
  }

  let pessoa = null;

  if (aluno.pessoaId) {
    pessoa = await tx.pessoa.findUnique({
      where: {
        id: aluno.pessoaId,
      },
      select: {
        id: true,
        emailPrincipal: true,
        aluno: {
          select: {
            id: true,
          },
        },
        usuario: {
          select: {
            id: true,
            senhaHash: true,
            status: true,
          },
        },
      },
    });

    if (!pessoa) {
      throw new Error(
        'Aluno aponta para Pessoa inexistente.',
      );
    }

    if (
      pessoa.aluno &&
      pessoa.aluno.id !== aluno.id
    ) {
      throw new Error(
        'Pessoa ja vinculada a outro Aluno.',
      );
    }
  } else {
    const pessoas = await tx.pessoa.findMany({
      where: {
        emailPrincipal: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        emailPrincipal: true,
        aluno: {
          select: {
            id: true,
          },
        },
        usuario: {
          select: {
            id: true,
            senhaHash: true,
            status: true,
          },
        },
      },
    });

    if (pessoas.length > 1) {
      throw new Error(
        'Mais de uma Pessoa encontrada para o aluno.',
      );
    }

    pessoa = pessoas[0] || null;

    if (
      pessoa?.aluno &&
      pessoa.aluno.id !== aluno.id
    ) {
      throw new Error(
        'Pessoa ja vinculada a outro Aluno.',
      );
    }

    if (!pessoa) {
      const criada = await tx.pessoa.create({
        data: {
          nome: aluno.nome || 'Aluno',
          emailPrincipal: email,
          telefonePrincipal:
            aluno.whatsapp || null,
          ativo: true,
        },
        select: {
          id: true,
          emailPrincipal: true,
        },
      });

      pessoa = {
        ...criada,
        aluno: null,
        usuario: null,
      };
    }
  }

  if (
    normalizarEmail(pessoa.emailPrincipal) !==
    email
  ) {
    throw new Error(
      'E-mail do Aluno diverge da Pessoa vinculada.',
    );
  }

  let usuario = pessoa.usuario || null;
  const senhaAluno = aluno.senhaHash || null;

  if (!usuario) {
    usuario = await tx.usuario.create({
      data: {
        pessoaId: pessoa.id,
        senhaHash: senhaAluno,
        status: senhaAluno
          ? 'ATIVO'
          : 'PENDENTE_ATIVACAO',
      },
      select: {
        id: true,
        senhaHash: true,
        status: true,
      },
    });
  } else {
    if (
      usuario.senhaHash &&
      senhaAluno &&
      usuario.senhaHash !== senhaAluno
    ) {
      throw new Error(
        'Aluno e Usuario possuem credenciais divergentes.',
      );
    }

    const dadosUsuario = {};

    if (!usuario.senhaHash && senhaAluno) {
      dadosUsuario.senhaHash = senhaAluno;
    }

    if (
      (usuario.senhaHash || senhaAluno) &&
      usuario.status === 'PENDENTE_ATIVACAO'
    ) {
      dadosUsuario.status = 'ATIVO';
    }

    if (
      Object.keys(dadosUsuario).length > 0
    ) {
      usuario = await tx.usuario.update({
        where: {
          id: usuario.id,
        },
        data: dadosUsuario,
        select: {
          id: true,
          senhaHash: true,
          status: true,
        },
      });
    }
  }

  if (
    usuario.status === 'ATIVO' &&
    !usuario.senhaHash &&
    !senhaAluno
  ) {
    throw new Error(
      'Usuario ativo sem credencial exige conferencia.',
    );
  }

  const dadosAluno = {};

  if (aluno.pessoaId !== pessoa.id) {
    dadosAluno.pessoaId = pessoa.id;
  }

  if (
    usuario.senhaHash &&
    !senhaAluno
  ) {
    dadosAluno.senhaHash =
      usuario.senhaHash;
  }

  if (Object.keys(dadosAluno).length > 0) {
    await tx.aluno.update({
      where: {
        id: aluno.id,
      },
      data: dadosAluno,
    });
  }

  return {
    ...aluno,
    pessoaId: pessoa.id,
    senhaHash:
      usuario.senhaHash || senhaAluno,
    usuario,
  };
}
