// src/lib/admin-permissoes.js
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  CAMPO_LEGADO_POR_PERMISSAO,
  PERMISSOES,
  obterPermissaoDoModulo,
} from "@/lib/permissoes";

export { prisma };

function novoAcessoAdministrativoValido(conta) {
  const usuario = conta?.pessoa?.usuario;
  const acessoAdministrativo = usuario?.acessoAdministrativo;

  return (
    usuario?.status === "ATIVO" &&
    acessoAdministrativo?.ativo === true &&
    acessoAdministrativo?.papel === conta?.role
  );
}

function possuiPermissaoNova(conta, codigo) {
  if (!codigo || !novoAcessoAdministrativoValido(conta)) {
    return false;
  }

  return Boolean(
    conta.pessoa.usuario.permissoes?.some(
      (vinculo) =>
        vinculo?.permissao?.ativo === true &&
        vinculo.permissao.codigo === codigo,
    ),
  );
}

function possuiPermissaoLegada(conta, codigo) {
  const campo = CAMPO_LEGADO_POR_PERMISSAO[codigo];

  return Boolean(campo && conta?.[campo]);
}

export function contaTemPermissao(conta, codigo) {
  const possuiAcessoAdministrativoNovo = Boolean(
    conta?.pessoa?.usuario?.acessoAdministrativo,
  );

  if (possuiAcessoAdministrativoNovo) {
    return possuiPermissaoNova(conta, codigo);
  }

  return possuiPermissaoLegada(conta, codigo);
}

export function permissoesEfetivasDaConta(conta) {
  const ehAdmin = conta?.role === "ADMIN";

  return {
    podeGerenciarSucatas:
      ehAdmin ||
      contaTemPermissao(conta, PERMISSOES.SUCATAS_GERENCIAR),

    podeGerenciarDepoimentos:
      ehAdmin ||
      contaTemPermissao(conta, PERMISSOES.DEPOIMENTOS_GERENCIAR),

    podeGerenciarJornada:
      ehAdmin ||
      contaTemPermissao(conta, PERMISSOES.JORNADA_GERENCIAR),
  };
}

export async function obterAcessoAtual() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.usuarioId ||
    !session?.user?.pessoaId
  ) {
    return {
      permitido: false,
      status: 401,
      motivo: "Não autorizado.",
    };
  }

  const conta = await prisma.adminUser.findUnique({
    where: {
      pessoaId: session.user.pessoaId,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
      ativo: true,
      podeGerenciarSucatas: true,
      podeGerenciarDepoimentos: true,
      podeGerenciarJornada: true,
      pessoa: {
        select: {
          id: true,
          usuario: {
            select: {
              id: true,
              status: true,
              mustChangePassword: true,
              acessoAdministrativo: {
                select: {
                  papel: true,
                  ativo: true,
                },
              },
              permissoes: {
                select: {
                  permissao: {
                    select: {
                      codigo: true,
                      ativo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!conta?.ativo) {
    return {
      permitido: false,
      status: 403,
      motivo: "Conta inativa.",
    };
  }

  const usuario = conta.pessoa?.usuario;

  const acessoAdministrativo =
    usuario?.acessoAdministrativo;

  if (
    !usuario ||
    usuario.id !== session.user.usuarioId ||
    usuario.status !== "ATIVO" ||
    !acessoAdministrativo?.ativo ||
    acessoAdministrativo.papel !== conta.role
  ) {
    return {
      permitido: false,
      status: 403,
      motivo: "Acesso administrativo indisponível.",
    };
  }

  const permissoesEfetivas =
    permissoesEfetivasDaConta(conta);

  return {
    permitido: true,
    status: 200,
    conta: {
      ...conta,

      // Identidade canonica e contextos.
      usuarioId: usuario.id,
      pessoaId: conta.pessoa.id,
      adminUserId: conta.id,

      papelAdministrativo:
        acessoAdministrativo.papel,

      // A fonte canonica passa a ser Usuario.
      mustChangePassword: Boolean(
        usuario.mustChangePassword,
      ),

      ...permissoesEfetivas,
    },
  };
}

export async function obterAcessoModulo(modulo) {
  const acesso = await obterAcessoAtual();
  if (!acesso.permitido) return acesso;

  const permissao = obterPermissaoDoModulo(modulo);
  const ehAdmin = acesso.conta.role === "ADMIN";
  const ehParceiroAutorizado =
    acesso.conta.role === "PARCEIRO" &&
    Boolean(permissao) &&
    contaTemPermissao(acesso.conta, permissao);

  if (!ehAdmin && !ehParceiroAutorizado) {
    return {
      permitido: false,
      status: 403,
      motivo: "Você não possui permissão para este módulo.",
      conta: acesso.conta,
    };
  }

  return {
    permitido: true,
    status: 200,
    conta: acesso.conta,
    ehAdmin,
  };
}

export async function obterAcessoAdmin() {
  const acesso = await obterAcessoAtual();
  if (!acesso.permitido) return acesso;

  if (acesso.conta.role !== "ADMIN") {
    return {
      permitido: false,
      status: 403,
      motivo: "Acesso restrito a administradores.",
      conta: acesso.conta,
    };
  }

  if (acesso.conta.mustChangePassword) {
    return {
      permitido: false,
      status: 403,
      motivo: "É necessário definir uma nova senha antes de continuar.",
      conta: acesso.conta,
    };
  }

  return {
    permitido: true,
    status: 200,
    conta: acesso.conta,
    ehAdmin: true,
  };
}

export function respostaAcessoNegado(acesso) {
  return Response.json(
    { error: acesso.motivo || "Acesso negado." },
    {
      status: acesso.status || 403,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}
