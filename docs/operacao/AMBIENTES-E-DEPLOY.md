# Ambientes e fluxo de publicação

Este documento registra como os ambientes do MGU devem ser utilizados durante desenvolvimento, homologação e produção.

## Visão geral

O projeto utiliza dois branches permanentes:

- `homologacao` — desenvolvimento e validação;
- `main` — produção.

A promoção normal ocorre sempre no sentido:

```text
local
  ↓
homologacao
  ↓
Vercel Preview
  ↓
validação
  ↓
main
  ↓
Vercel Production
```

## Desenvolvimento local

Branch esperado:

```text
homologacao
```

Banco esperado:

```text
Neon — homologacao
```

O desenvolvimento local nunca deve apontar para o banco de produção.

O arquivo local de variáveis de ambiente não deve ser versionado.

Antes de iniciar uma alteração, confirmar:

```bash
git branch --show-current
git status --short
```

## Preview da Vercel

Deploys originados do branch:

```text
homologacao
```

são utilizados como ambiente de Preview/homologação online.

Banco esperado:

```text
Neon — homologacao
```

Local e Preview compartilham deliberadamente o mesmo banco de homologação.

Isso permite validar no Preview os mesmos dados de teste utilizados durante o desenvolvimento, mas exige cuidado para que testes destrutivos ou massas temporárias sejam controlados.

## Produção

Branch:

```text
main
```

Deploy:

```text
Vercel Production
```

Banco:

```text
Neon — production
```

O banco de produção não deve ser usado durante desenvolvimento local nem em Vercel Preview.

## Alterações de banco

O comando de build atual é:

```text
prisma generate && next build
```

O build não aplica migrações automaticamente.

Alterações de schema ou dados devem ser executadas deliberadamente no ambiente correto.

Fluxo esperado:

1. preparar e revisar a alteração no branch `homologacao`;
2. revisar o SQL/migração quando aplicável;
3. aplicar primeiro no banco de homologação;
4. validar aplicação, testes, lint e build;
5. validar a Preview;
6. somente depois preparar a promoção para produção.

Migrações destrutivas ou backfills relevantes exigem procedimento específico documentado em `docs/migracoes/`.

## Validação antes de commit

A validação mínima para alterações de código é:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Dependendo da funcionalidade, também deve haver smoke test funcional na Preview.

## Promoção para produção

Código validado em `homologacao` não deve ser considerado automaticamente pronto para produção.

A promoção para `main` deve ocorrer somente depois da validação explícita do conjunto de mudanças.

Antes da promoção, revisar ao menos:

- alterações de banco;
- variáveis de ambiente;
- integrações externas;
- autenticação e permissões;
- testes automatizados;
- lint;
- build;
- comportamento na Preview;
- documentação arquitetural afetada.

## Regra de documentação

Quando uma alteração modificar arquitetura, regras estruturais, ambientes ou roadmap, atualizar também:

```text
docs/arquitetura/Arquitetura-MGU-v3.0.txt
```

no mesmo ciclo da mudança.
