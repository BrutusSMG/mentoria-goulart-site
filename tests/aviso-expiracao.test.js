import { describe, expect, it, vi } from 'vitest';

import {
  buscarVigenciasParaAviso,
  criarEmailAvisoExpiracao,
  DIAS_AVISO_EXPIRACAO,
  enviarAvisoExpiracao,
  processarAvisosExpiracao,
  vigenciaElegivelParaAviso,
} from '../src/lib/aviso-expiracao';

describe('vigenciaElegivelParaAviso', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  function criarVigencia(sobrescritas = {}) {
    return {
      status: 'ATIVA',
      iniciaEm: new Date('2026-01-01T12:00:00.000Z'),
      expiraEm: new Date('2026-10-09T12:00:00.000Z'),
      avisoExpiracaoEnviadoEm: null,
      ...sobrescritas,
    };
  }

  it('usa 30 dias como antecedência padrão', () => {
    expect(DIAS_AVISO_EXPIRACAO).toBe(30);
  });

  it('permite aviso exatamente 30 dias antes da expiração', () => {
    expect(
      vigenciaElegivelParaAviso(criarVigencia(), agora),
    ).toBe(true);
  });

  it('não permite aviso quando faltam mais de 30 dias', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          expiraEm: new Date('2026-10-10T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe(false);
  });

  it('permite aviso quando faltam menos de 30 dias', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          expiraEm: new Date('2026-09-20T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe(true);
  });

  it('não permite aviso para vigência já expirada', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          expiraEm: new Date('2026-09-08T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe(false);
  });

  it('não permite aviso exatamente no instante da expiração', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          expiraEm: agora,
        }),
        agora,
      ),
    ).toBe(false);
  });

  it('não permite aviso para vigência sem expiração definida', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          expiraEm: null,
        }),
        agora,
      ),
    ).toBe(false);
  });

  it('não permite novo aviso quando o envio já foi registrado', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          avisoExpiracaoEnviadoEm: new Date('2026-09-01T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe(false);
  });

  it.each(['SUSPENSA', 'CANCELADA', 'ENCERRADA'])(
    'não permite aviso para vigência %s',
    (status) => {
      expect(
        vigenciaElegivelParaAviso(
          criarVigencia({ status }),
          agora,
        ),
      ).toBe(false);
    },
  );

  it('não permite aviso para vigência que ainda não iniciou', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          status: 'AGENDADA',
          iniciaEm: new Date('2026-09-10T12:00:00.000Z'),
        }),
        agora,
      ),
    ).toBe(false);
  });

  it('permite aviso para AGENDADA cuja data de início já chegou', () => {
    expect(
      vigenciaElegivelParaAviso(
        criarVigencia({
          status: 'AGENDADA',
          iniciaEm: agora,
        }),
        agora,
      ),
    ).toBe(true);
  });
});

describe('buscarVigenciasParaAviso', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  it('consulta somente vigências elegíveis para aviso', async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    const db = {
      vigenciaMatricula: {
        findMany,
      },
    };

    await expect(
      buscarVigenciasParaAviso(agora, db),
    ).resolves.toEqual([]);

    const limite = new Date('2026-10-09T12:00:00.000Z');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        avisoExpiracaoEnviadoEm: null,
        status: {
          in: ['AGENDADA', 'ATIVA'],
        },
        iniciaEm: {
          lte: agora,
        },
        expiraEm: {
          gt: agora,
          lte: limite,
        },
        matricula: {
          status: 'ATIVA',
          aluno: {
            status: 'ATIVO',
          },
        },
      },
      select: {
        id: true,
        expiraEm: true,
        matricula: {
          select: {
            produtoNome: true,
            aluno: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        expiraEm: 'asc',
      },
    });
  });

  it('falha quando o banco informado é inválido', async () => {
    await expect(
      buscarVigenciasParaAviso(agora, null),
    ).rejects.toThrow('Banco de dados inválido.');
  });
});

describe('criarEmailAvisoExpiracao', () => {
  function criarVigencia() {
    return {
      id: 'vigencia-123',
      expiraEm: new Date('2026-10-09T12:00:00.000Z'),
      matricula: {
        produtoNome: 'Curso Garimpo & Ouro',
        aluno: {
          nome: 'Aluno <Teste>',
          email: 'aluno@example.com',
        },
      },
    };
  }

  it('monta o e-mail com destinatário, assunto e chave de idempotência', () => {
    const email = criarEmailAvisoExpiracao(criarVigencia());

    expect(email.from).toBe(
      'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
    );

    expect(email.to).toBe('aluno@example.com');

    expect(email.subject).toBe(
      'Seu acesso ao Curso Garimpo & Ouro está próximo do vencimento',
    );

    expect(email.idempotencyKey).toBe(
      'aviso-expiracao/vigencia-123',
    );
  });

  it('inclui a data de expiração formatada no conteúdo', () => {
    const email = criarEmailAvisoExpiracao(criarVigencia());

    expect(email.html).toContain('09/10/2026');
  });

  it('escapa nome e produto antes de inserir no HTML', () => {
    const email = criarEmailAvisoExpiracao(criarVigencia());

    expect(email.html).toContain('Aluno &lt;Teste&gt;');
    expect(email.html).toContain('Curso Garimpo &amp; Ouro');
    expect(email.html).not.toContain('Aluno <Teste>');
  });

  it('falha quando faltam dados obrigatórios', () => {
    expect(() =>
      criarEmailAvisoExpiracao({
        id: 'vigencia-123',
        expiraEm: null,
        matricula: {
          produtoNome: 'Curso Garimpo Urbano',
          aluno: {
            nome: 'Aluno',
            email: 'aluno@example.com',
          },
        },
      }),
    ).toThrow('Dados insuficientes para aviso de expiração.');
  });
});

describe('enviarAvisoExpiracao', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  function criarVigencia() {
    return {
      id: 'vigencia-123',
      expiraEm: new Date('2026-10-09T12:00:00.000Z'),
      matricula: {
        produtoNome: 'Curso Garimpo Urbano',
        aluno: {
          nome: 'Aluno Teste',
          email: 'aluno@example.com',
        },
      },
    };
  }

  it('envia o e-mail e registra o aviso após sucesso', async () => {
    const send = vi.fn().mockResolvedValue({
      data: {
        id: 'email-123',
      },
      error: null,
    });

    const updateMany = vi.fn().mockResolvedValue({
      count: 1,
    });

    const resend = {
      emails: {
        send,
      },
    };

    const db = {
      vigenciaMatricula: {
        updateMany,
      },
    };

    await expect(
      enviarAvisoExpiracao(criarVigencia(), {
        resend,
        db,
        agora,
      }),
    ).resolves.toEqual({
      enviado: true,
      registrado: true,
      emailId: 'email-123',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Prof. Goulart <contato@mentoriagarimpourbano.com.br>',
        to: 'aluno@example.com',
      }),
      {
        idempotencyKey: 'aviso-expiracao/vigencia-123',
      },
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'vigencia-123',
        avisoExpiracaoEnviadoEm: null,
      },
      data: {
        avisoExpiracaoEnviadoEm: agora,
      },
    });
  });

  it('não registra o aviso quando o Resend retorna erro', async () => {
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Falha simulada no Resend.',
      },
    });

    const updateMany = vi.fn();

    const resend = {
      emails: {
        send,
      },
    };

    const db = {
      vigenciaMatricula: {
        updateMany,
      },
    };

    await expect(
      enviarAvisoExpiracao(criarVigencia(), {
        resend,
        db,
        agora,
      }),
    ).rejects.toThrow('Falha simulada no Resend.');

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('não registra o aviso quando o Resend lança exceção', async () => {
    const send = vi.fn().mockRejectedValue(
      new Error('Resend indisponível.'),
    );

    const updateMany = vi.fn();

    const resend = {
      emails: {
        send,
      },
    };

    const db = {
      vigenciaMatricula: {
        updateMany,
      },
    };

    await expect(
      enviarAvisoExpiracao(criarVigencia(), {
        resend,
        db,
        agora,
      }),
    ).rejects.toThrow('Resend indisponível.');

    expect(updateMany).not.toHaveBeenCalled();
  });
});

describe('processarAvisosExpiracao', () => {
  const agora = new Date('2026-09-09T12:00:00.000Z');

  function criarVigencia(id, email) {
    return {
      id,
      expiraEm: new Date('2026-09-20T12:00:00.000Z'),
      matricula: {
        produtoNome: 'Curso Garimpo Urbano',
        aluno: {
          nome: `Aluno ${id}`,
          email,
        },
      },
    };
  }

  it('processa todas as vigências mesmo quando uma delas falha', async () => {
    const vigencias = [
      criarVigencia('vigencia-1', 'aluno1@example.com'),
      criarVigencia('vigencia-2', 'aluno2@example.com'),
      criarVigencia('vigencia-3', 'aluno3@example.com'),
    ];

    const findMany = vi.fn().mockResolvedValue(vigencias);

    const updateMany = vi.fn()
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 1 });

    const send = vi.fn()
      .mockResolvedValueOnce({
        data: { id: 'email-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Falha simulada.',
        },
      })
      .mockResolvedValueOnce({
        data: { id: 'email-3' },
        error: null,
      });

    const db = {
      vigenciaMatricula: {
        findMany,
        updateMany,
      },
    };

    const resend = {
      emails: {
        send,
      },
    };

    const resultado = await processarAvisosExpiracao({
      agora,
      resend,
      db,
    });

    expect(resultado).toEqual({
      encontrados: 3,
      enviados: 2,
      falhas: 1,
      resultados: [
        {
          vigenciaId: 'vigencia-1',
          sucesso: true,
          registrado: true,
          emailId: 'email-1',
        },
        {
          vigenciaId: 'vigencia-2',
          sucesso: false,
          erro: 'Falha simulada.',
        },
        {
          vigenciaId: 'vigencia-3',
          sucesso: true,
          registrado: true,
          emailId: 'email-3',
        },
      ],
    });

    expect(send).toHaveBeenCalledTimes(3);
    expect(updateMany).toHaveBeenCalledTimes(2);
  });

  it('retorna resumo vazio quando não há vigências elegíveis', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const updateMany = vi.fn();
    const send = vi.fn();

    const db = {
      vigenciaMatricula: {
        findMany,
        updateMany,
      },
    };

    const resend = {
      emails: {
        send,
      },
    };

    await expect(
      processarAvisosExpiracao({
        agora,
        resend,
        db,
      }),
    ).resolves.toEqual({
      encontrados: 0,
      enviados: 0,
      falhas: 0,
      resultados: [],
    });

    expect(send).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});