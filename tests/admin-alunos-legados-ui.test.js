import {
  describe,
  expect,
  it,
} from 'vitest';

import { readFile } from 'node:fs/promises';

const paginaUrl = new URL(
  '../src/app/(admin)/admin/alunos/legados/novo/page.jsx',
  import.meta.url,
);

const listagemUrl = new URL(
  '../src/app/(admin)/admin/alunos/page.jsx',
  import.meta.url,
);

describe('interface administrativa de alunos legados', () => {
  it('liga a listagem ao formulario de cadastro legado', async () => {
    const fonte = await readFile(
      listagemUrl,
      'utf8',
    );

    expect(fonte).toContain(
      '/admin/alunos/legados/novo',
    );

    expect(fonte).toContain(
      'Adicionar aluno legado',
    );

    expect(fonte).toContain(
      'dados?.cadastroLegadoHabilitado',
    );
  });

  it('usa somente a rota de cadastro e nao dispara convite', async () => {
    const fonte = await readFile(
      paginaUrl,
      'utf8',
    );

    expect(fonte).toContain(
      '/api/admin/alunos/legados',
    );

    expect(fonte).not.toContain(
      '/convite-legado',
    );

    expect(fonte).not.toContain(
      'CONVITE_LEGADO_ENVIO_REAL_HABILITADO',
    );
  });

  it('exige produto e vigencia no formulario', async () => {
    const fonte = await readFile(
      paginaUrl,
      'utf8',
    );

    expect(fonte).toContain('produtoIds');
    expect(fonte).toContain('vigencias');
    expect(fonte).toContain('tipoDuracao');
    expect(fonte).toContain(
      'dataFimOriginal',
    );
  });
});
