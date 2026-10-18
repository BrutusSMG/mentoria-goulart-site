import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import {
  criarServicosOrganizacao,
  ErroDominioOrganizacao,
  traduzirErroUnicidadeOrganizacao,
} from '../src/lib/servicos-organizacao.js';

const AGORA = new Date('2026-10-18T17:00:00.000Z');
const acessoAdmin = (usuarioId = 'usuario_admin') => ({
  permitido: true, ehAdmin: true,
  conta: { id: 'adminuser_legado', usuarioId, role: 'ADMIN', mustChangePassword: false },
});
const org = (id = 'org_1', campos = {}) => ({
  id, pais: 'BR', nomeFantasia: 'Original', razaoSocial: null, cnpj: null,
  email: null, telefone: null, site: null, statusValidacao: 'PRELIMINAR',
  statusOperacional: 'ATIVA', motivoUltimaRejeicao: null,
  criadoPorUsuarioId: 'usuario_admin', alteradoPorUsuarioId: null,
  validacaoDecididaPorUsuarioId: null, validacaoDecididaEm: null,
  createdAt: AGORA, updatedAt: AGORA, ...campos,
});
const vinculo = (id, campos = {}) => ({
  id, organizacaoId: 'org_1', pessoaId: 'pessoa_1', funcao: null,
  status: 'PENDENTE', principal: false, inicioEm: null, fimEm: null,
  criadoPorUsuarioId: 'usuario_admin', alteradoPorUsuarioId: null,
  encerradoPorUsuarioId: null, createdAt: AGORA, updatedAt: AGORA, ...campos,
});

function corresponde(linha, where = {}) {
  return Object.entries(where).every(([campo, esperado]) =>
    esperado && typeof esperado === 'object' && !Array.isArray(esperado)
      ? ('in' in esperado ? esperado.in.includes(linha[campo]) : false)
      : linha[campo] === esperado);
}

// Simulador determinístico de rollback; serializa as transações. NÃO é PostgreSQL
// nem substitui testes reais de lock, isolamento, CHECK e índice parcial.
function bancoFalso({ organizacoes = [org()], vinculos = [], pessoas = ['pessoa_1', 'pessoa_2'] } = {}) {
  let estado = { organizacoes: structuredClone(organizacoes), vinculos: structuredClone(vinculos), pessoas: [...pessoas] };
  let fila = Promise.resolve();
  const chamadas = [];
  let contador = 0;
  let falharAtualizacao = null;
  let transacoesRevertidas = 0;

  function modelo(nome, trabalho) {
    const chave = nome === 'organizacao' ? 'organizacoes' : 'vinculos';
    return {
      async create({ data }) {
        const novo = { id: `novo_${++contador}`, ...data, createdAt: AGORA, updatedAt: AGORA };
        trabalho[chave].push(novo);
        chamadas.push(`criar:${nome}`);
        return structuredClone(novo);
      },
      async findUnique({ where }) {
        const found = trabalho[chave].find((r) => corresponde(r, where));
        return found ? structuredClone(found) : null;
      },
      async findFirst({ where }) {
        const found = trabalho[chave].find((r) => corresponde(r, where));
        return found ? structuredClone(found) : null;
      },
      async updateMany({ where, data }) {
        chamadas.push(`alterar:${nome}`);
        if (falharAtualizacao && falharAtualizacao(nome, where, data)) {
          throw new Error('falha simulada antes do UPDATE');
        }
        const itens = trabalho[chave].filter((r) => corresponde(r, where));
        for (const item of itens) Object.assign(item, data, { updatedAt: new Date(AGORA.getTime() + 5000) });
        return { count: itens.length };
      },
    };
  }
  const prisma = {
    async $transaction(fn) {
      const anterior = fila;
      let liberar;
      fila = new Promise((resolve) => { liberar = resolve; });
      await anterior;
      const trabalho = structuredClone(estado);
      const tx = {
        organizacao: modelo('organizacao', trabalho),
        pessoaOrganizacao: modelo('pessoaOrganizacao', trabalho),
        pessoa: {
          async findUnique({ where }) {
            return trabalho.pessoas.includes(where.id) ? { id: where.id } : null;
          },
        },
        async $queryRaw(_literais, id) {
          chamadas.push(`lock:${id}`);
          return trabalho.organizacoes.some((o) => o.id === id) ? [{ id }] : [];
        },
      };
      try {
        const result = await fn(tx);
        estado = trabalho;
        return result;
      } catch (err) {
        transacoesRevertidas += 1;
        throw err;
      } finally {
        liberar();
      }
    },
  };
  return {
    prisma, chamadas,
    get estado() { return structuredClone(estado); },
    get revertidas() { return transacoesRevertidas; },
    aoAtualizar(funcao) { falharAtualizacao = funcao; },
  };
}

function servicos(banco, usuarioId) {
  return criarServicosOrganizacao({ prisma: banco.prisma, acesso: acessoAdmin(usuarioId), agora: () => AGORA });
}
async function erro(promise, codigo, status = 409) {
  await assert.rejects(promise, (e) => e instanceof ErroDominioOrganizacao && e.codigo === codigo && e.status === status);
}

describe('E7.2 / D2 — conflitos reais de índices', () => {
  it('traduz apenas índices conhecidos e preserva erros desconhecidos', () => {
    const colisoes = [
      [{ code: 'P2002', meta: { target: ['cnpj'] } }, 'CNPJ_EM_USO'],
      [{ code: '23505', constraint: 'Organizacao_cnpj_key' }, 'CNPJ_EM_USO'],
      [{ code: 'P2002', meta: { target: 'PessoaOrganizacao_par_aberto_uidx' } }, 'VINCULO_ABERTO_EXISTENTE'],
      [{ code: '23505', constraint: 'PessoaOrganizacao_principal_ativo_uidx' }, 'CONFLITO_CONCORRENCIA'],
    ];
    for (const [entrada, codigo] of colisoes) {
      const saida = traduzirErroUnicidadeOrganizacao(entrada);
      assert.equal(saida.codigo, codigo);
      assert.equal(saida.status, 409);
    }
    const desconhecido = { code: 'P2002', meta: { target: ['outra_coluna'] } };
    assert.equal(traduzirErroUnicidadeOrganizacao(desconhecido), desconhecido);
    const indisponivel = { code: 'P1001' };
    assert.equal(traduzirErroUnicidadeOrganizacao(indisponivel), indisponivel);
  });
});

describe('E7.2 / D2 — autorização de construção e cadastro', () => {
  it('rejeita acesso PARCEIRO, ADMIN sem permissão e usuário sem identidade canônica', () => {
    const b = bancoFalso();
    for (const acesso of [
      { ...acessoAdmin(), ehAdmin: false },
      { ...acessoAdmin(), conta: { ...acessoAdmin().conta, role: 'PARCEIRO' } },
      { ...acessoAdmin(), conta: { ...acessoAdmin().conta, usuarioId: '' } },
      { ...acessoAdmin(), conta: { ...acessoAdmin().conta, mustChangePassword: true } },
    ]) {
      assert.throws(() => criarServicosOrganizacao({ prisma: b.prisma, acesso }), /ACESSO_NEGADO/);
    }
  });

  it('cria apenas o cadastro interno, com autoria em Usuario.id', async () => {
    const b = bancoFalso({ organizacoes: [] });
    const item = await servicos(b).criar({ nomeFantasia: ' Empresa ', cnpj: null });
    assert.equal(item.nomeFantasia, 'Empresa');
    assert.equal(item.pais, 'BR');
    assert.equal(item.statusValidacao, 'PRELIMINAR');
    assert.equal(item.statusOperacional, 'ATIVA');
    assert.equal(item.criadoPorUsuarioId, 'usuario_admin');
    assert.notEqual(item.criadoPorUsuarioId, acessoAdmin().conta.id);
    assert.deepEqual(b.estado.vinculos, []);
  });

  it('não cria organização com identidade ausente, CNPJ incorreto ou campo extra', async () => {
    const b = bancoFalso({ organizacoes: [] });
    const s = servicos(b);
    await erro(s.criar({ email: 'a@b.com' }), 'NOME_OBRIGATORIO', 400);
    await erro(s.criar({ nomeFantasia: 'Empresa', cnpj: '00000000000000' }), 'CNPJ_INVALIDO', 400);
    await erro(s.criar({ nomeFantasia: 'Empresa', statusValidacao: 'VALIDADA' }), 'ENTRADA_INVALIDA', 400);
    assert.deepEqual(b.estado.organizacoes, []);
  });

  it('retorna 404 em organização inexistente e exige ID válido', async () => {
    const b = bancoFalso(); const s = servicos(b);
    await erro(s.editar('inexistente', { email: 'a@b.com' }), 'NAO_ENCONTRADO', 404);
    await erro(s.editar('', { email: 'a@b.com' }), 'ENTRADA_INVALIDA', 400);
  });
});

describe('E7.2 / D2 — edição e opção B', () => {
  it('no-op não escreve, mesmo sob lock', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusValidacao: 'VALIDADA' })] });
    const antes = b.estado.organizacoes[0];
    const item = await servicos(b).editar('org_1', { nomeFantasia: ' Original ' });
    assert.deepEqual(item, antes);
    assert.equal(b.chamadas.filter((x) => x.startsWith('alterar:')).length, 0);
  });

  it('VALIDADA exige reconfirmação para nome ou CNPJ alterados', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusValidacao: 'VALIDADA' })] });
    await erro(servicos(b).editar('org_1', { nomeFantasia: 'Nova' }), 'RECONFIRMACAO_OBRIGATORIA');
    await erro(servicos(b).editar('org_1', { cnpj: '11222333000181' }), 'RECONFIRMACAO_OBRIGATORIA');
    assert.equal(b.estado.organizacoes[0].nomeFantasia, 'Original');
    assert.equal(b.revertidas, 2);
  });

  it('opção B modifica identidade e registra decisão conjuntamente', async () => {
    const anterior = org('org_1', { statusValidacao: 'VALIDADA', motivoUltimaRejeicao: 'Histórico' });
    const b = bancoFalso({ organizacoes: [anterior] });
    const resultado = await servicos(b, 'usuario_2').editar('org_1', {
      nomeFantasia: ' Nova ', email: ' ADMIN@EXEMPLO.COM ', reconfirmarValidacao: true,
    });
    assert.equal(resultado.nomeFantasia, 'Nova');
    assert.equal(resultado.email, 'admin@exemplo.com');
    assert.equal(resultado.statusValidacao, 'VALIDADA');
    assert.equal(resultado.alteradoPorUsuarioId, 'usuario_2');
    assert.equal(resultado.validacaoDecididaPorUsuarioId, 'usuario_2');
    assert.deepEqual(resultado.validacaoDecididaEm, AGORA);
    assert.equal(resultado.motivoUltimaRejeicao, 'Histórico');
  });

  it('contato somente não muda a última validação', async () => {
    const antiga = new Date('2026-10-10T12:00:00Z');
    const b = bancoFalso({ organizacoes: [org('org_1', {
      statusValidacao: 'VALIDADA', validacaoDecididaEm: antiga,
      validacaoDecididaPorUsuarioId: 'outro',
    })] });
    const item = await servicos(b).editar('org_1', { telefone: '0011-90000' });
    assert.equal(item.telefone, '0011-90000');
    assert.deepEqual(item.validacaoDecididaEm, antiga);
    assert.equal(item.validacaoDecididaPorUsuarioId, 'outro');
  });

  it('nega reconfirmação desnecessária e rejeita remover ambos os nomes', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusValidacao: 'VALIDADA' })] });
    const s = servicos(b);
    await erro(s.editar('org_1', { telefone: '123', reconfirmarValidacao: true }), 'CONFIRMACAO_INAPLICAVEL', 400);
    await erro(s.editar('org_1', { razaoSocial: 'R' }), 'RECONFIRMACAO_OBRIGATORIA');
    await erro(s.editar('org_1', { nomeFantasia: null, reconfirmarValidacao: true }), 'NOME_OBRIGATORIO', 400);
  });

  it('PRELIMINAR e REJEITADA corrigem identificação sem reconfirmação', async () => {
    for (const statusValidacao of ['PRELIMINAR', 'REJEITADA']) {
      const b = bancoFalso({ organizacoes: [org('org_1', { statusValidacao })] });
      const s = servicos(b);
      assert.equal((await s.editar('org_1', { nomeFantasia: 'Nova' })).statusValidacao, statusValidacao);
      await erro(s.editar('org_1', { telefone: '000', reconfirmarValidacao: true }), 'CONFIRMACAO_INAPLICAVEL', 400);
    }
  });
});

describe('E7.2 / D2 — validação, reanálise e operação', () => {
  it('PRELIMINAR → VALIDADA grava autor e data, inclusive sem CNPJ', async () => {
    const b = bancoFalso(); const s = servicos(b);
    const item = await s.decidirValidacao('org_1', { acao: 'VALIDAR' });
    assert.equal(item.statusValidacao, 'VALIDADA');
    assert.equal(item.cnpj, null);
    assert.equal(item.validacaoDecididaPorUsuarioId, 'usuario_admin');
    assert.deepEqual(item.validacaoDecididaEm, AGORA);
    await erro(s.decidirValidacao('org_1', { acao: 'VALIDAR' }), 'TRANSICAO_INVALIDA');
  });

  it('rejeitar exige motivo e mantém o último motivo após reanálise', async () => {
    const b = bancoFalso(); const s = servicos(b);
    for (const motivo of ['', '   ', null, 'x'.repeat(2001)]) {
      await erro(s.decidirValidacao('org_1', { acao: 'REJEITAR', motivo }), 'ENTRADA_INVALIDA', 400);
    }
    const rejeitada = await s.decidirValidacao('org_1', { acao: 'REJEITAR', motivo: '  Falta documento  ' });
    assert.equal(rejeitada.motivoUltimaRejeicao, 'Falta documento');
    const preliminar = await s.decidirValidacao('org_1', { acao: 'RETORNAR_PRELIMINAR' });
    assert.equal(preliminar.statusValidacao, 'PRELIMINAR');
    assert.equal(preliminar.motivoUltimaRejeicao, 'Falta documento');
    assert.deepEqual(preliminar.validacaoDecididaEm, AGORA);
    const validada = await s.decidirValidacao('org_1', { acao: 'VALIDAR' });
    assert.equal(validada.motivoUltimaRejeicao, 'Falta documento');
  });

  it('nega salto direto e retorno de preliminar para preliminar', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusValidacao: 'VALIDADA' })] });
    const s = servicos(b);
    await erro(s.decidirValidacao('org_1', { acao: 'REJEITAR', motivo: 'x' }), 'TRANSICAO_INVALIDA');
    await s.decidirValidacao('org_1', { acao: 'RETORNAR_PRELIMINAR' });
    await erro(s.decidirValidacao('org_1', { acao: 'RETORNAR_PRELIMINAR' }), 'TRANSICAO_INVALIDA');
    await erro(s.decidirValidacao('org_1', { acao: 'VALIDAR', motivo: 'extra' }), 'ENTRADA_INVALIDA', 400);
  });

  it('ATIVA ↔ INATIVA sem fechar vínculos e transição repetida dá conflito', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1', { status: 'ATIVO', inicioEm: AGORA })] });
    const s = servicos(b);
    await s.alterarOperacao('org_1', { acao: 'INATIVAR' });
    assert.equal(b.estado.vinculos[0].status, 'ATIVO');
    await erro(s.alterarOperacao('org_1', { acao: 'INATIVAR' }), 'TRANSICAO_INVALIDA');
    assert.equal((await s.alterarOperacao('org_1', { acao: 'REATIVAR' })).statusOperacional, 'ATIVA');
  });
});

describe('E7.2 / D2 — gestão de vínculos', () => {
  it('cria PENDENTE sem mudar Pessoa ou Usuario', async () => {
    const b = bancoFalso(); const s = servicos(b);
    const novo = await s.criarVinculo('org_1', { pessoaId: 'pessoa_1', funcao: '  Compras  ' });
    assert.equal(novo.status, 'PENDENTE');
    assert.equal(novo.principal, false);
    assert.equal(novo.funcao, 'Compras');
    assert.equal(novo.criadoPorUsuarioId, 'usuario_admin');
    assert.deepEqual(b.estado.pessoas, ['pessoa_1', 'pessoa_2']);
    assert.equal(b.chamadas[0], 'lock:org_1');
  });

  it('rejeita organização inativa, pessoa desconhecida e vínculo aberto duplicado', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1')] }); const s = servicos(b);
    await erro(s.criarVinculo('org_1', { pessoaId: 'pessoa_1' }), 'VINCULO_ABERTO_EXISTENTE');
    await erro(s.criarVinculo('org_1', { pessoaId: 'fantasma' }), 'NAO_ENCONTRADO', 404);
    await s.alterarOperacao('org_1', { acao: 'INATIVAR' });
    await erro(s.criarVinculo('org_1', { pessoaId: 'pessoa_2' }), 'ORGANIZACAO_INATIVA');
    await erro(s.criarVinculo('org_1', { pessoaId: 'pessoa_2', status: 'ATIVO' }), 'ENTRADA_INVALIDA', 400);
  });

  it('ativa pendente e registra período e autor', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1')] });
    const s = servicos(b, 'usuario_2');
    const item = await s.ativarVinculo('org_1', 'v_1');
    assert.equal(item.status, 'ATIVO');
    assert.deepEqual(item.inicioEm, AGORA);
    assert.equal(item.alteradoPorUsuarioId, 'usuario_2');
    await erro(s.ativarVinculo('org_1', 'v_1'), 'TRANSICAO_INVALIDA');
  });

  it('INATIVA impede ativação mas permite encerramento de pendente', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusOperacional: 'INATIVA' })], vinculos: [vinculo('v_1')] });
    const s = servicos(b);
    await erro(s.ativarVinculo('org_1', 'v_1'), 'ORGANIZACAO_INATIVA');
    const item = await s.encerrarVinculo('org_1', 'v_1');
    assert.equal(item.inicioEm, null);
    assert.deepEqual(item.fimEm, AGORA);
    assert.equal(item.encerradoPorUsuarioId, 'usuario_admin');
    await erro(s.encerrarVinculo('org_1', 'v_1'), 'TRANSICAO_INVALIDA');
  });

  it('encerrar ATIVO remove principal e preserva início; novo período permite novo registro', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1', { status: 'ATIVO', principal: true, inicioEm: AGORA })] });
    const s = servicos(b);
    const item = await s.encerrarVinculo('org_1', 'v_1');
    assert.equal(item.status, 'ENCERRADO');
    assert.equal(item.principal, false);
    assert.deepEqual(item.inicioEm, AGORA);
    assert.deepEqual(item.fimEm, AGORA);
    const novo = await s.criarVinculo('org_1', { pessoaId: 'pessoa_1' });
    assert.notEqual(novo.id, 'v_1');
    assert.equal(b.estado.vinculos.length, 2);
  });

  it('corrige função inclusive do ENCERRADO, sem alterar datas ou status', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusOperacional: 'INATIVA' })],
      vinculos: [vinculo('v_1', { status: 'ENCERRADO', fimEm: AGORA })] });
    const s = servicos(b);
    const atual = await s.editarFuncaoVinculo('org_1', 'v_1', { funcao: '  Ex-coordenador ' });
    assert.equal(atual.funcao, 'Ex-coordenador');
    assert.equal(atual.status, 'ENCERRADO');
    assert.deepEqual(atual.fimEm, AGORA);
    const qtd = b.chamadas.length;
    await s.editarFuncaoVinculo('org_1', 'v_1', { funcao: 'Ex-coordenador' });
    assert.equal(b.chamadas.slice(qtd).filter((x) => x.startsWith('alterar:')).length, 0);
  });

  it('vínculo de outra organização sempre 404, até para principal', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1'), org('org_2')],
      vinculos: [vinculo('v_2', { organizacaoId: 'org_2', status: 'ATIVO', inicioEm: AGORA })] });
    const s = servicos(b);
    await erro(s.editarFuncaoVinculo('org_1', 'v_2', { funcao: 'Direção' }), 'NAO_ENCONTRADO', 404);
    await erro(s.ativarVinculo('org_1', 'v_2'), 'NAO_ENCONTRADO', 404);
    await erro(s.encerrarVinculo('org_1', 'v_2'), 'NAO_ENCONTRADO', 404);
    await erro(s.definirPrincipal('org_1', { vinculoId: 'v_2' }), 'NAO_ENCONTRADO', 404);
  });
});

describe('E7.2 / D2 — contato principal, rollback e concorrência simulada', () => {
  const ativos = () => [
    vinculo('v_1', { status: 'ATIVO', inicioEm: AGORA }),
    vinculo('v_2', { status: 'ATIVO', inicioEm: AGORA, pessoaId: 'pessoa_2' }),
  ];

  it('seleciona e troca principal em ordem desmarcar → marcar, com autor', async () => {
    const b = bancoFalso({ vinculos: ativos() }); const s = servicos(b, 'usuario_2');
    await s.definirPrincipal('org_1', { vinculoId: 'v_1' });
    const antes = b.chamadas.length;
    const resultado = await s.definirPrincipal('org_1', { vinculoId: 'v_2' });
    assert.deepEqual(resultado, { organizacaoId: 'org_1', vinculoId: 'v_2', alterado: true });
    assert.deepEqual(b.chamadas.slice(antes), ['lock:org_1', 'alterar:pessoaOrganizacao', 'alterar:pessoaOrganizacao']);
    assert.equal(b.estado.vinculos.filter((v) => v.principal).length, 1);
    assert.equal(b.estado.vinculos.find((v) => v.principal).id, 'v_2');
    assert.equal(b.estado.vinculos[0].alteradoPorUsuarioId, 'usuario_2');
  });

  it('principal igual e remoção repetida são no-op sem alterar datas', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1', { status: 'ATIVO', principal: true, inicioEm: AGORA })] });
    const s = servicos(b); const qtd = b.chamadas.length;
    assert.equal((await s.definirPrincipal('org_1', { vinculoId: 'v_1' })).alterado, false);
    assert.equal((await s.definirPrincipal('org_1', { vinculoId: null })).alterado, true);
    assert.equal((await s.definirPrincipal('org_1', { vinculoId: null })).alterado, false);
    assert.equal(b.chamadas.slice(qtd).filter((x) => x.startsWith('alterar:')).length, 1);
  });

  it('permite mudar principal mesmo com organização INATIVA', async () => {
    const b = bancoFalso({ organizacoes: [org('org_1', { statusOperacional: 'INATIVA' })], vinculos: ativos() });
    await servicos(b).definirPrincipal('org_1', { vinculoId: 'v_2' });
    assert.equal(b.estado.vinculos.find((v) => v.principal).id, 'v_2');
  });

  it('bloqueia principal PENDENTE ou ENCERRADO', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1'), vinculo('v_2', { status: 'ENCERRADO', fimEm: AGORA })] });
    const s = servicos(b);
    await erro(s.definirPrincipal('org_1', { vinculoId: 'v_1' }), 'PRINCIPAL_INVALIDO');
    await erro(s.definirPrincipal('org_1', { vinculoId: 'v_2' }), 'PRINCIPAL_INVALIDO');
    assert.equal(b.estado.vinculos.filter((v) => v.principal).length, 0);
  });

  it('simula rollback integral se atualização falha depois de desmarcar anterior', async () => {
    const b = bancoFalso({ vinculos: [
      vinculo('v_1', { status: 'ATIVO', principal: true, inicioEm: AGORA }),
      vinculo('v_2', { status: 'ATIVO', inicioEm: AGORA, pessoaId: 'pessoa_2' }),
    ] });
    b.aoAtualizar((_modelo, where) => where.id === 'v_2');
    await assert.rejects(servicos(b).definirPrincipal('org_1', { vinculoId: 'v_2' }), /falha simulada/);
    assert.equal(b.estado.vinculos.find((v) => v.principal).id, 'v_1');
    assert.equal(b.revertidas, 1);
  });

  it('simula duas criações concorrentes para mesmo par; uma falha', async () => {
    const b = bancoFalso({ vinculos: [] }); const s = servicos(b);
    const resultados = await Promise.allSettled([
      s.criarVinculo('org_1', { pessoaId: 'pessoa_1' }),
      s.criarVinculo('org_1', { pessoaId: 'pessoa_1' }),
    ]);
    assert.equal(resultados.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(resultados.filter((r) => r.status === 'rejected' && r.reason.codigo === 'VINCULO_ABERTO_EXISTENTE').length, 1);
    assert.equal(b.estado.vinculos.length, 1);
  });

  it('simula criar vínculo antes de inativar; pendência permanece histórica', async () => {
    const b = bancoFalso(); const s = servicos(b);
    const [criar, inativar] = await Promise.all([
      s.criarVinculo('org_1', { pessoaId: 'pessoa_1' }),
      s.alterarOperacao('org_1', { acao: 'INATIVAR' }),
    ]);
    assert.equal(criar.status, 'PENDENTE');
    assert.equal(inativar.statusOperacional, 'INATIVA');
    assert.equal(b.estado.vinculos[0].status, 'PENDENTE');
  });

  it('simula ativar vínculo antes de inativar; ativo permanece', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1')] }); const s = servicos(b);
    const [ativar, inativar] = await Promise.all([
      s.ativarVinculo('org_1', 'v_1'),
      s.alterarOperacao('org_1', { acao: 'INATIVAR' }),
    ]);
    assert.equal(ativar.status, 'ATIVO');
    assert.equal(inativar.statusOperacional, 'INATIVA');
    assert.equal(b.estado.vinculos[0].status, 'ATIVO');
  });

  it('simula ativação versus inativação serializadas; não há ativação tardia', async () => {
    const b = bancoFalso({ vinculos: [vinculo('v_1')] }); const s = servicos(b);
    const [operacao, ativacao] = await Promise.allSettled([
      s.alterarOperacao('org_1', { acao: 'INATIVAR' }), s.ativarVinculo('org_1', 'v_1'),
    ]);
    assert.equal(operacao.status, 'fulfilled');
    assert.equal(ativacao.status, 'rejected');
    assert.equal(ativacao.reason.codigo, 'ORGANIZACAO_INATIVA');
    assert.equal(b.estado.vinculos[0].status, 'PENDENTE');
  });

  it('simula duas trocas simultâneas de principal com no máximo um ativo', async () => {
    const b = bancoFalso({ vinculos: ativos() }); const s = servicos(b);
    await Promise.all([s.definirPrincipal('org_1', { vinculoId: 'v_1' }), s.definirPrincipal('org_1', { vinculoId: 'v_2' })]);
    assert.equal(b.estado.vinculos.filter((v) => v.principal && v.status === 'ATIVO').length, 1);
  });
});
