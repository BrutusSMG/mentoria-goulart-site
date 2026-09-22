import {
  prepararCadastroPessoaLegado,
  prepararVigenciasLegado,
  validarProdutosCadastroLegado,
} from '@/lib/cadastro-pessoa-legado';

/**
 * Executar exclusivamente dentro de prisma.$transaction(async (tx) => ...).
 *
 * Primeira versão: cria apenas cadastros novos.
 * Não reutiliza identidades existentes, não envia convites
 * e não registra transações fictícias na Hotmart.
 */
export async function criarAlunoLegado(tx, dados, agora = new Date()) {
  if (
    !(agora instanceof Date) ||
    Number.isNaN(agora.getTime())
  ) {
    throw new Error('Data de cadastro inválida.');
  }

  const cadastro = prepararCadastroPessoaLegado(dados);

  const vigencias = prepararVigenciasLegado(
    cadastro.produtoIds,
    dados?.vigencias,
  );

  const produtos = await validarProdutosCadastroLegado(
    tx,
    cadastro.produtoIds,
  );

  // Esta versão não vincula automaticamente registros preexistentes.
  // Um e-mail coincidente exige conferência antes da migração.
  const filtroEmail = {
    equals: cadastro.email,
    mode: 'insensitive',
  };

  const [
    pessoaExistente,
    alunoExistente,
    leadExistente,
    usuarioAdminExistente,
  ] = await Promise.all([
    tx.pessoa.findFirst({
      where: { emailPrincipal: filtroEmail },
      select: { id: true },
    }),
    tx.aluno.findFirst({
      where: { email: filtroEmail },
      select: { id: true },
    }),
    tx.lead.findFirst({
      where: { email: filtroEmail },
      select: { id: true },
    }),
    tx.adminUser.findFirst({
      where: { email: filtroEmail },
      select: { id: true },
    }),
  ]);

  if (
    pessoaExistente ||
    alunoExistente ||
    leadExistente ||
    usuarioAdminExistente
  ) {
    throw new Error(
      'Já existe um cadastro com este e-mail. ' +
      'É necessária uma conferência antes de vincular o aluno legado.',
    );
  }

  const pessoa = await tx.pessoa.create({
    data: {
      nome: cadastro.nome,
      emailPrincipal: cadastro.email,
      telefonePrincipal: cadastro.telefone,
    },
  });

  const aluno = await tx.aluno.create({
    data: {
      nome: cadastro.nome,
      email: cadastro.email,
      whatsapp: cadastro.telefone,
      origem: 'LEGADO',
      status: 'ATIVO',
      pessoaId: pessoa.id,
    },
  });

  await tx.perfilAluno.create({
    data: { alunoId: aluno.id },
  });

  const vigenciaPorProduto = new Map(
    vigencias.map((vigencia) => [
      vigencia.produtoId,
      vigencia,
    ]),
  );

  const resultadoProdutos = [];

  for (const produto of produtos) {
    const configuracao = vigenciaPorProduto.get(produto.id);

    let expiraEm = null;

    if (configuracao.tipoDuracao === 'DEFINIDA') {
      /*
       * Convenção provisória deste fluxo:
       * a data civil informada é válida até o fim do dia
       * no horário de Brasília (UTC-03).
       *
       * A data de expiração armazenada é o primeiro instante
       * do dia seguinte. A tela administrativa deverá informar
       * explicitamente essa convenção antes de entrar em uso.
       */
      const [ano, mes, dia] =
        configuracao.dataFimOriginal
          .split('-')
          .map(Number);

      expiraEm = new Date(
        Date.UTC(ano, mes - 1, dia + 1, 3, 0, 0),
      );
    }

    const expirado =
      expiraEm !== null && expiraEm <= agora;

    const status = expirado ? 'ENCERRADA' : 'ATIVA';

    let matriculaId = null;

    // Cursos geram matrícula e vigência educacional.
    // eBooks recebem direitos diretamente, sem matrícula.
    if (produto.tipo === 'CURSO') {
      const matricula = await tx.matricula.create({
        data: {
          alunoId: aluno.id,
          produtoId: produto.id,
          produtoNome: produto.nome,
          origem: 'LEGADO',
          status,
          concedidaEm: agora,
          ...(expirado ? { encerradaEm: agora } : {}),
        },
      });

      matriculaId = matricula.id;

      await tx.vigenciaMatricula.create({
        data: {
          matriculaId,
          origem: 'LEGADO',
          tipoDuracao: configuracao.tipoDuracao,
          status: expirado ? 'ENCERRADA' : 'ATIVA',
          concedidaEm: agora,
          iniciaEm: expirado ? expiraEm : agora,
          expiraEm,
          statusAlteradoEm: agora,
          ...(expirado ? { encerradaEm: agora } : {}),
        },
      });
    }

    /*
     * Produto com prazo original encerrado não recebe
     * nenhuma concessão ativa de acesso.
     */
    if (!expirado) {
      for (const direito of produto.direitos) {
        await tx.direitoConcedido.create({
          data: {
            alunoId: aluno.id,
            produtoDireitoId: direito.id,
            origem: 'LEGADO',
            status: 'ATIVO',
            concedidoEm: agora,
            iniciaEm: agora,
            expiraEm,
            statusAlteradoEm: agora,
          },
        });
      }
    }

    resultadoProdutos.push({
      produtoId: produto.id,
      matriculaId,
      tipoDuracao: configuracao.tipoDuracao,
      expiraEm,
      status,
    });
  }

  return {
    pessoaId: pessoa.id,
    alunoId: aluno.id,
    origem: 'LEGADO',
    convite: 'PENDENTE',
    produtos: resultadoProdutos,
  };
}
