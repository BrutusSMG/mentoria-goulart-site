# Procedimento de migrações e alterações de dados

Este documento define o procedimento mínimo para mudanças de schema, migrações, backfills e alterações controladas de dados no MGU.

## Princípios

Toda alteração de banco deve respeitar a separação entre ambientes:

```text
homologacao → production
```

Nunca testar uma migração diretamente em produção.

Nunca usar o banco de produção no desenvolvimento local.

Nenhuma migração deve ser aplicada automaticamente durante o build da aplicação.

## Ambientes

### Homologação

Branch:

```text
homologacao
```

Banco:

```text
Neon — homologacao
```

É o primeiro ambiente compartilhado onde migrações e alterações de dados devem ser aplicadas e validadas.

### Produção

Branch:

```text
main
```

Banco:

```text
Neon — production
```

Só deve receber alterações já validadas em homologação.

## Alterações de schema

Mudanças no `prisma/schema.prisma` devem seguir este fluxo:

1. alterar o schema no branch `homologacao`;
2. revisar a mudança;
3. gerar ou preparar a migração correspondente;
4. revisar o SQL antes de aplicar;
5. aplicar no banco de homologação;
6. regenerar o Prisma Client;
7. executar testes, lint e build;
8. validar funcionalmente;
9. validar a Vercel Preview;
10. documentar a alteração quando necessário;
11. somente depois preparar a execução em produção.

## Revisão obrigatória

Antes de aplicar uma migração, verificar se ela contém:

- remoção de tabela;
- remoção de coluna;
- alteração de tipo;
- alteração de nulabilidade;
- criação ou remoção de índice único;
- alteração de chave estrangeira;
- atualização em massa;
- operação que possa bloquear ou apagar dados.

Qualquer um desses casos exige atenção adicional.

## Migrações destrutivas

Migrações destrutivas não devem ser tratadas como uma alteração comum.

Antes da execução, deve existir um plano contendo:

- motivo da mudança;
- dados afetados;
- impacto esperado;
- necessidade de backup;
- estratégia de rollback;
- ordem de execução;
- validação pós-migração.

O procedimento específico deve ser registrado nesta pasta.

## Backfills

Backfill é qualquer preenchimento ou correção de dados existentes em massa.

Um backfill deve ser:

- idempotente sempre que possível;
- executado primeiro em homologação;
- revisado quanto à quantidade de registros afetados;
- protegido contra execução acidental no ambiente errado;
- documentado quando houver impacto relevante.

## Produção

Antes de aplicar uma alteração em produção, confirmar explicitamente:

```text
branch: main
ambiente: production
banco: Neon production
```

Também confirmar que a mesma alteração já foi executada e validada em homologação.

## Validação após migração

Depois da execução, conferir:

- aplicação da migração sem erro;
- tabelas e colunas esperadas;
- constraints e índices;
- registros existentes;
- funcionalidades afetadas;
- logs da aplicação;
- testes automatizados;
- build;
- Preview ou produção, conforme o ambiente.

## Prisma e build

O build atual executa:

```text
prisma generate && next build
```

Ele não aplica migrações.

Essa separação é intencional e deve ser preservada.

## Registro

Migrações ou alterações de dados que exijam procedimento especial devem receber um documento próprio nesta pasta.

Formato recomendado:

```text
AAAA-MM-DD-nome-da-alteracao.md
```

Exemplo:

```text
2026-09-06-backfill-matriculas-legadas.md
```

## Arquitetura

Quando uma migração alterar o modelo arquitetural, entidades principais, regras de negócio ou fluxo de dados, atualizar também:

```text
docs/arquitetura/Arquitetura-MGU-v3.0.txt
```
