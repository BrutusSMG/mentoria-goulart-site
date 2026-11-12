// E7.2/D2 — serviços transacionais internos, ainda sem rotas ou schema implantado.
// Instanciar APENAS após obterAcessoAdmin() devolver acesso vigente de ADMIN.
// A segurança HTTP (incluindo origem/CSRF) pertence à futura D3.
import {
  LIMITES_ORGANIZACAO,
  nomesOrganizacaoValidos,
  validarEntradaOrganizacao,
} from './validacoes-organizacao.js';

export class ErroDominioOrganizacao extends Error {
  constructor(codigo, status = 409) {
    super(codigo);
    this.name = 'ErroDominioOrganizacao';
    this.codigo = codigo;
    this.status = status;
  }
}

function falhar(codigo, status = 409) {
  throw new ErroDominioOrganizacao(codigo, status);
}

// Traduzir somente colisões de índices identificados. Falhas desconhecidas de
// persistência devem chegar ao tratamento genérico da futura rota, não virar 409.
export function traduzirErroUnicidadeOrganizacao(erro) {
  if (erro instanceof ErroDominioOrganizacao) return erro;
  if (erro?.code !== 'P2002' && erro?.code !== '23505') return erro;
  const alvo = erro?.meta?.target;
  const nomes = [
    ...(Array.isArray(alvo) ? alvo : typeof alvo === 'string' ? [alvo] : []),
    erro?.meta?.constraint, erro?.constraint,
  ].filter((nome) => typeof nome === 'string');
  if (nomes.some((nome) => ['cnpj', 'Organizacao_cnpj_key'].includes(nome))) {
    return new ErroDominioOrganizacao('CNPJ_EM_USO');
  }
  if (nomes.includes('PessoaOrganizacao_par_aberto_uidx')) {
    return new ErroDominioOrganizacao('VINCULO_ABERTO_EXISTENTE');
  }
  if (nomes.includes('PessoaOrganizacao_principal_ativo_uidx')) {
    return new ErroDominioOrganizacao('CONFLITO_CONCORRENCIA');
  }
  return erro;
}

function objetoExato(valor, chaves, { obrigatorias = [] } = {}) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)
      || Object.keys(valor).some((chave) => !chaves.includes(chave))
      || obrigatorias.some((chave) => !Object.hasOwn(valor, chave))) {
    falhar('ENTRADA_INVALIDA', 400);
  }
}

function idValido(valor) {
  return typeof valor === 'string' && valor.trim() !== '' && valor === valor.trim();
}

function entradaCadastral(valor, parcial) {
  const resultado = validarEntradaOrganizacao(valor, { parcial });
  if (!resultado.valido) falhar(resultado.codigo, 400);
  return resultado;
}

function normalizarFuncao(valor) {
  if (valor == null) return null;
  if (typeof valor !== 'string') falhar('ENTRADA_INVALIDA', 400);
  const funcao = valor.trim();
  if (funcao.length > LIMITES_ORGANIZACAO.funcao) falhar('ENTRADA_INVALIDA', 400);
  return funcao || null;
}

function timestamp(agora) {
  const data = agora();
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
    throw new TypeError('Relógio transacional inválido.');
  }
  return data;
}

// O lock é adquirido ANTES de consultar/modificar vínculos. O valor interpolado
// é parametrizado pelo Prisma; nunca concatenar SQL com IDs recebidos.
async function bloquearOrganizacao(tx, id) {
  const linhas = await tx.$queryRaw`
    SELECT "id" FROM "Organizacao" WHERE "id" = ${id} FOR UPDATE
  `;
  if (!Array.isArray(linhas) || linhas.length !== 1) falhar('NAO_ENCONTRADO', 404);
  const organizacao = await tx.organizacao.findUnique({ where: { id } });
  if (!organizacao) falhar('NAO_ENCONTRADO', 404);
  return organizacao;
}

async function obterVinculo(tx, organizacaoId, vinculoId) {
  const vinculo = await tx.pessoaOrganizacao.findFirst({
    where: { id: vinculoId, organizacaoId },
  });
  if (!vinculo) falhar('NAO_ENCONTRADO', 404);
  return vinculo;
}

async function atualizarUma(modelo, where, data) {
  const { count } = await modelo.updateMany({ where, data });
  if (count !== 1) falhar('CONFLITO_CONCORRENCIA');
}

function conferirAtor(acesso) {
  if (acesso?.permitido !== true || acesso.ehAdmin !== true
    || acesso.conta?.role !== 'ADMIN' || acesso.conta.mustChangePassword
    || !idValido(acesso.conta.usuarioId)) {
    falhar('ACESSO_NEGADO', 403);
  }
  return acesso.conta.usuarioId; // Usuario.id; nunca AdminUser.id.
}

// O cliente é injetado para testar sem Neon e, futuramente, usar PrismaClient.
// Por enquanto os modelos Organizacao/PessoaOrganizacao NÃO existem no schema.
export function criarServicosOrganizacao({ prisma, acesso, agora = () => new Date() }) {
  const usuarioId = conferirAtor(acesso);
  if (!prisma || typeof prisma.$transaction !== 'function') {
    throw new TypeError('Cliente transacional inválido.');
  }
  const transacionar = async (trabalho) => {
    try {
      return await prisma.$transaction(trabalho);
    } catch (erro) {
      throw traduzirErroUnicidadeOrganizacao(erro);
    }
  };

  return Object.freeze({
    async criar(entrada) {
      const { dados } = entradaCadastral(entrada, false);
      return transacionar((tx) => tx.organizacao.create({
        data: {
          ...dados,
          pais: 'BR',
          statusValidacao: 'PRELIMINAR',
          statusOperacional: 'ATIVA',
          criadoPorUsuarioId: usuarioId,
        },
      }));
    },

    async editar(organizacaoId, entrada) {
      if (!idValido(organizacaoId)) falhar('ENTRADA_INVALIDA', 400);
      const { dados, reconfirmarValidacao = false } = entradaCadastral(entrada, true);
      return transacionar(async (tx) => {
        const atual = await bloquearOrganizacao(tx, organizacaoId);
        const proposto = { ...atual, ...dados };
        if (!nomesOrganizacaoValidos(proposto)) falhar('NOME_OBRIGATORIO', 400);

        const alterados = Object.fromEntries(Object.entries(dados).filter(
          ([chave, valor]) => atual[chave] !== valor,
        ));
        const identificacaoMudou = ['nomeFantasia', 'razaoSocial', 'cnpj'].some(
          (campo) => Object.hasOwn(alterados, campo),
        );
        const exigeReconfirmacao = atual.statusValidacao === 'VALIDADA' && identificacaoMudou;
        if (exigeReconfirmacao && !reconfirmarValidacao) {
          falhar('RECONFIRMACAO_OBRIGATORIA');
        }
        if (reconfirmarValidacao && !exigeReconfirmacao) {
          falhar('CONFIRMACAO_INAPLICAVEL', 400);
        }
        if (Object.keys(alterados).length === 0) return atual; // no-op, sem updatedAt.
        await atualizarUma(tx.organizacao,
          { id: organizacaoId, statusValidacao: atual.statusValidacao },
          {
            ...alterados,
            alteradoPorUsuarioId: usuarioId,
            ...(exigeReconfirmacao ? {
              validacaoDecididaPorUsuarioId: usuarioId,
              validacaoDecididaEm: timestamp(agora),
            } : {}),
          });
        return tx.organizacao.findUnique({ where: { id: organizacaoId } });
      });
    },

    async decidirValidacao(organizacaoId, entrada) {
      if (!idValido(organizacaoId)) falhar('ENTRADA_INVALIDA', 400);
      objetoExato(entrada, ['acao', 'motivo'], { obrigatorias: ['acao'] });
      const { acao } = entrada;
      if (!['VALIDAR', 'REJEITAR', 'RETORNAR_PRELIMINAR'].includes(acao)) {
        falhar('ENTRADA_INVALIDA', 400);
      }
      let motivo;
      if (acao === 'REJEITAR') {
        if (typeof entrada.motivo !== 'string' || !entrada.motivo.trim()
          || entrada.motivo.trim().length > LIMITES_ORGANIZACAO.motivoRejeicao) {
          falhar('ENTRADA_INVALIDA', 400);
        }
        motivo = entrada.motivo.trim();
      } else if (Object.hasOwn(entrada, 'motivo')) {
        falhar('ENTRADA_INVALIDA', 400);
      }

      return transacionar(async (tx) => {
        const atual = await bloquearOrganizacao(tx, organizacaoId);
        const destino = acao === 'VALIDAR' ? 'VALIDADA'
          : acao === 'REJEITAR' ? 'REJEITADA' : 'PRELIMINAR';
        if (destino === 'PRELIMINAR'
          ? atual.statusValidacao === 'PRELIMINAR'
          : atual.statusValidacao !== 'PRELIMINAR') {
          falhar('TRANSICAO_INVALIDA');
        }
        const data = {
          statusValidacao: destino,
          alteradoPorUsuarioId: usuarioId,
          ...(destino === 'PRELIMINAR' ? {} : {
            validacaoDecididaPorUsuarioId: usuarioId,
            validacaoDecididaEm: timestamp(agora),
          }),
          ...(destino === 'REJEITADA' ? { motivoUltimaRejeicao: motivo } : {}),
        };
        await atualizarUma(tx.organizacao, { id: organizacaoId, statusValidacao: atual.statusValidacao }, data);
        return tx.organizacao.findUnique({ where: { id: organizacaoId } });
      });
    },

    async alterarOperacao(organizacaoId, entrada) {
      if (!idValido(organizacaoId)) falhar('ENTRADA_INVALIDA', 400);
      objetoExato(entrada, ['acao'], { obrigatorias: ['acao'] });
      const destino = entrada.acao === 'INATIVAR' ? 'INATIVA'
        : entrada.acao === 'REATIVAR' ? 'ATIVA' : null;
      if (!destino) falhar('ENTRADA_INVALIDA', 400);
      return transacionar(async (tx) => {
        const atual = await bloquearOrganizacao(tx, organizacaoId);
        if (atual.statusOperacional === destino) falhar('TRANSICAO_INVALIDA');
        await atualizarUma(tx.organizacao,
          { id: organizacaoId, statusOperacional: atual.statusOperacional },
          { statusOperacional: destino, alteradoPorUsuarioId: usuarioId });
        return tx.organizacao.findUnique({ where: { id: organizacaoId } });
      });
    },

    async criarVinculo(organizacaoId, entrada) {
      if (!idValido(organizacaoId)) falhar('ENTRADA_INVALIDA', 400);
      objetoExato(entrada, ['pessoaId', 'funcao'], { obrigatorias: ['pessoaId'] });
      if (!idValido(entrada.pessoaId)) falhar('ENTRADA_INVALIDA', 400);
      const funcao = normalizarFuncao(entrada.funcao);
      return transacionar(async (tx) => {
        const organizacao = await bloquearOrganizacao(tx, organizacaoId);
        if (organizacao.statusOperacional !== 'ATIVA') falhar('ORGANIZACAO_INATIVA');
        const pessoa = await tx.pessoa.findUnique({
          where: { id: entrada.pessoaId }, select: { id: true },
        });
        if (!pessoa) falhar('NAO_ENCONTRADO', 404);
        const aberto = await tx.pessoaOrganizacao.findFirst({
          where: { organizacaoId, pessoaId: entrada.pessoaId, status: { in: ['PENDENTE', 'ATIVO'] } },
          select: { id: true },
        });
        if (aberto) falhar('VINCULO_ABERTO_EXISTENTE');
        return tx.pessoaOrganizacao.create({
          data: {
            organizacaoId, pessoaId: entrada.pessoaId, funcao,
            status: 'PENDENTE', principal: false,
            criadoPorUsuarioId: usuarioId,
          },
        });
      });
    },

    async editarFuncaoVinculo(organizacaoId, vinculoId, entrada) {
      if (!idValido(organizacaoId) || !idValido(vinculoId)) falhar('ENTRADA_INVALIDA', 400);
      objetoExato(entrada, ['funcao'], { obrigatorias: ['funcao'] });
      const funcao = normalizarFuncao(entrada.funcao);
      return transacionar(async (tx) => {
        await bloquearOrganizacao(tx, organizacaoId);
        const atual = await obterVinculo(tx, organizacaoId, vinculoId);
        if (atual.funcao === funcao) return atual;
        await atualizarUma(tx.pessoaOrganizacao,
          { id: vinculoId, organizacaoId, status: atual.status },
          { funcao, alteradoPorUsuarioId: usuarioId });
        return tx.pessoaOrganizacao.findUnique({ where: { id: vinculoId } });
      });
    },

    async ativarVinculo(organizacaoId, vinculoId) {
      if (!idValido(organizacaoId) || !idValido(vinculoId)) falhar('ENTRADA_INVALIDA', 400);
      return transacionar(async (tx) => {
        const organizacao = await bloquearOrganizacao(tx, organizacaoId);
        const atual = await obterVinculo(tx, organizacaoId, vinculoId);
        if (organizacao.statusOperacional !== 'ATIVA') falhar('ORGANIZACAO_INATIVA');
        if (atual.status !== 'PENDENTE') falhar('TRANSICAO_INVALIDA');
        await atualizarUma(tx.pessoaOrganizacao,
          { id: vinculoId, organizacaoId, status: 'PENDENTE' },
          { status: 'ATIVO', inicioEm: timestamp(agora), alteradoPorUsuarioId: usuarioId });
        return tx.pessoaOrganizacao.findUnique({ where: { id: vinculoId } });
      });
    },

    async encerrarVinculo(organizacaoId, vinculoId) {
      if (!idValido(organizacaoId) || !idValido(vinculoId)) falhar('ENTRADA_INVALIDA', 400);
      return transacionar(async (tx) => {
        await bloquearOrganizacao(tx, organizacaoId);
        const atual = await obterVinculo(tx, organizacaoId, vinculoId);
        if (!['PENDENTE', 'ATIVO'].includes(atual.status)) falhar('TRANSICAO_INVALIDA');
        const dataHora = timestamp(agora);
        // O CHECK do banco exige fimEm >= inicioEm, mesmo com relógio atrasado.
        const fimEm = atual.inicioEm && dataHora < atual.inicioEm ? atual.inicioEm : dataHora;
        await atualizarUma(tx.pessoaOrganizacao,
          { id: vinculoId, organizacaoId, status: atual.status },
          {
            status: 'ENCERRADO', fimEm, principal: false,
            encerradoPorUsuarioId: usuarioId, alteradoPorUsuarioId: usuarioId,
          });
        return tx.pessoaOrganizacao.findUnique({ where: { id: vinculoId } });
      });
    },

    async definirPrincipal(organizacaoId, entrada) {
      if (!idValido(organizacaoId)) falhar('ENTRADA_INVALIDA', 400);
      objetoExato(entrada, ['vinculoId'], { obrigatorias: ['vinculoId'] });
      const destino = entrada.vinculoId;
      if (destino !== null && !idValido(destino)) falhar('ENTRADA_INVALIDA', 400);
      return transacionar(async (tx) => {
        await bloquearOrganizacao(tx, organizacaoId);
        let escolhido = null;
        if (destino !== null) {
          escolhido = await obterVinculo(tx, organizacaoId, destino);
          if (escolhido.status !== 'ATIVO') falhar('PRINCIPAL_INVALIDO');
        }
        const anterior = await tx.pessoaOrganizacao.findFirst({
          where: { organizacaoId, principal: true, status: 'ATIVO' },
        });
        if ((anterior?.id ?? null) === destino) {
          return { organizacaoId, vinculoId: destino, alterado: false };
        }
        if (anterior) {
          await atualizarUma(tx.pessoaOrganizacao,
            { id: anterior.id, organizacaoId, status: 'ATIVO', principal: true },
            { principal: false, alteradoPorUsuarioId: usuarioId });
        }
        if (escolhido) {
          await atualizarUma(tx.pessoaOrganizacao,
            { id: escolhido.id, organizacaoId, status: 'ATIVO', principal: false },
            { principal: true, alteradoPorUsuarioId: usuarioId });
        }
        return { organizacaoId, vinculoId: destino, alterado: true };
      });
    },
  });
}
