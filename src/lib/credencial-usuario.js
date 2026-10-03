// src/lib/credencial-usuario.js

function dataValidaOuNula(valor) {
  return (
    valor === null ||
    (
      valor instanceof Date &&
      !Number.isNaN(valor.getTime())
    )
  );
}

export async function definirCredencialCanonica(
  tx,
  {
    pessoaId,
    senhaHash,
    mustChangePassword = false,
    passwordChangedAt = null,
    ativarUsuario = false,
  },
) {
  const id = String(pessoaId || "").trim();
  const hash = String(senhaHash || "").trim();

  if (
    !id ||
    !hash ||
    !dataValidaOuNula(passwordChangedAt)
  ) {
    throw new TypeError(
      "Dados inv?lidos para definir credencial can?nica.",
    );
  }

  const pessoa = await tx.pessoa.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      aluno: {
        select: {
          id: true,
        },
      },
      adminUser: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!pessoa) {
    throw new Error(
      "Pessoa n?o encontrada para defini??o da credencial.",
    );
  }

  const usuario = await tx.usuario.upsert({
    where: {
      pessoaId: pessoa.id,
    },
    create: {
      pessoaId: pessoa.id,
      senhaHash: hash,
      status: "ATIVO",
      mustChangePassword:
        Boolean(mustChangePassword),
      passwordChangedAt,
    },
    update: {
      senhaHash: hash,
      mustChangePassword:
        Boolean(mustChangePassword),
      passwordChangedAt,
      ...(ativarUsuario
        ? {
            status: "ATIVO",
          }
        : {}),
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (pessoa.adminUser) {
    await tx.adminUser.update({
      where: {
        id: pessoa.adminUser.id,
      },
      data: {
        senha: hash,
        mustChangePassword:
          Boolean(mustChangePassword),
        passwordChangedAt,
      },
    });
  }

  if (pessoa.aluno) {
    await tx.aluno.update({
      where: {
        id: pessoa.aluno.id,
      },
      data: {
        senhaHash: hash,
      },
    });
  }

  return {
    pessoaId: pessoa.id,
    usuarioId: usuario.id,
    statusUsuario: usuario.status,
    possuiAdmin: Boolean(pessoa.adminUser),
    possuiAluno: Boolean(pessoa.aluno),
  };
}
