import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { obterOuCriarPessoa } from '@/lib/pessoa';
import { vincularCadastroPessoa } from '@/lib/vincular-pessoa';

class ErroVinculoPessoa extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

function respostaErro(mensagem, status) {
  return NextResponse.json(
    { ok: false, erro: mensagem },
    { status },
  );
}

export async function POST() {
  if (process.env.PESSOA_VINCULO_ALUNO_HABILITADO !== 'true') {
    return respostaErro('Vinculação indisponível.', 503);
  }

  const session = await getServerSession(authOptions);

  if (
    session?.user?.tipoConta !== 'ALUNO' ||
    !session?.user?.alunoId
  ) {
    return respostaErro('Acesso não autorizado.', 401);
  }

  // O identificador vem da sessão, nunca do corpo da requisição.
  const alunoId = session.user.alunoId;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.findUnique({
        where: { id: alunoId },
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          status: true,
          emailVerificadoEm: true,
          pessoaId: true,
        },
      });

      if (!aluno) {
        throw new ErroVinculoPessoa(
          'Aluno não encontrado.',
          404,
        );
      }

      if (aluno.status !== 'ATIVO') {
        throw new ErroVinculoPessoa(
          'Acesso indisponível.',
          403,
        );
      }

      if (!aluno.emailVerificadoEm) {
        throw new ErroVinculoPessoa(
          'É necessário verificar o e-mail antes da vinculação.',
          403,
        );
      }

      const pessoa = await obterOuCriarPessoa(tx, {
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.whatsapp,
      });

      const vinculos = await tx.pessoa.findUnique({
        where: { id: pessoa.id },
        select: {
          lead: { select: { id: true } },
          aluno: { select: { id: true } },
          adminUser: { select: { id: true } },
        },
      });

      // Nesta primeira versão, não reunimos automaticamente
      // cadastros de origens diferentes.
      if (vinculos?.lead || vinculos?.adminUser) {
        throw new ErroVinculoPessoa(
          'Identidade com outros cadastros: vinculação requer conferência.',
          409,
        );
      }

      if (
        (vinculos?.aluno && vinculos.aluno.id !== alunoId) ||
        (aluno.pessoaId && aluno.pessoaId !== pessoa.id)
      ) {
        throw new ErroVinculoPessoa(
          'Existe um vínculo de identidade conflitante.',
          409,
        );
      }

      return vincularCadastroPessoa(tx, {
        tipo: 'aluno',
        cadastroId: alunoId,
        pessoaId: pessoa.id,
      });
    });

    return NextResponse.json({
      ok: true,
      ...resultado,
    });
  } catch (error) {
    if (error instanceof ErroVinculoPessoa) {
      return respostaErro(error.message, error.status);
    }

    console.error(
      'Erro ao vincular Pessoa à conta do aluno:',
      error?.message,
    );

    return respostaErro(
      'Não foi possível concluir a vinculação.',
      500,
    );
  }
}