# Mentoria Garimpo Urbano — MGU

Plataforma web da Mentoria Garimpo Urbano.

O projeto reúne o site institucional, área administrativa, área do aluno, integrações, captação de leads e demais módulos do ecossistema MGU.

## Domínios

Domínios principais:

- `mentoriagarimpourbano.com.br`
- `cursogarimpourbano.com`
- `cursogarimpourbano.com.br` — domínio antigo

Subdomínios:

- `alunos.mentoriagarimpourbano.com.br`
- `admin.mentoriagarimpourbano.com.br`
- `ebook.mentoriagarimpourbano.com.br`

## Stack principal

- Next.js
- React
- Prisma
- PostgreSQL / Neon
- NextAuth
- Tailwind CSS
- Resend
- Brevo
- Vercel
- Vitest

## Ambientes

### Desenvolvimento local

Branch:

`homologacao`

Banco:

homologação

O ambiente local nunca deve usar o banco de produção.

### Preview / Homologação online

Branch:

`homologacao`

Deploy:

Vercel Preview

Banco:

homologação

O ambiente local e a Preview compartilham deliberadamente o banco de homologação.

### Produção

Branch:

`main`

Deploy:

Vercel Production

Banco:

produção

Alterações devem ser validadas primeiro em `homologacao` antes da promoção para `main`.

## Fluxo de desenvolvimento

Fluxo padrão:

```text
desenvolvimento local
        ↓
homologacao
        ↓
Vercel Preview
        ↓
validação
        ↓
main
        ↓
produção
```

Nunca aplicar alterações no banco de produção durante o desenvolvimento local.

## Instalação

Instale as dependências:

```bash
npm install
```

As variáveis de ambiente devem ser configuradas localmente em arquivo não versionado.

Credenciais reais, tokens, senhas e URLs privadas de banco não devem ser commitados.

## Comandos

Executar o ambiente de desenvolvimento:

```bash
npm run dev
```

Executar lint:

```bash
npm run lint
```

Executar testes automatizados:

```bash
npm test
```

Executar build:

```bash
npm run build
```

O build executa:

```text
prisma generate && next build
```

O processo de build não deve aplicar migrações automaticamente ao banco de dados.

## Testes

O projeto utiliza Vitest para testes unitários.

A baseline inicial está em:

```text
tests/validacoes.test.js
```

As validações compartilhadas estão centralizadas em:

```text
src/lib/validacoes.js
```

## Documentação

A documentação técnica está em:

```text
docs/
```

Estrutura:

```text
docs/
├── arquitetura/
├── operacao/
├── migracoes/
└── historico/
```

### Arquitetura vigente

A fonte de verdade arquitetural é:

```text
docs/arquitetura/Arquitetura-MGU-v3.0.txt
```

Sempre que uma alteração modificar decisões arquiteturais, regras estruturais ou o roadmap, esse documento deve ser atualizado no mesmo ciclo.

### Histórico

Documentos antigos permanecem em:

```text
docs/historico/
```

Eles servem como registro histórico e podem descrever estados que já não representam a aplicação atual.

## Banco de dados

O projeto utiliza Prisma com PostgreSQL.

Alterações de schema devem ser:

1. desenvolvidas e revisadas em `homologacao`;
2. aplicadas primeiro no banco de homologação;
3. validadas funcionalmente;
4. promovidas para produção somente após aprovação.

Migrações destrutivas exigem planejamento específico.

## Segurança

Não versionar:

- arquivos `.env`;
- credenciais;
- tokens;
- senhas;
- chaves de API;
- URLs privadas de banco.

Alterações automáticas de dependências, como `npm audit fix`, não devem ser executadas sem revisão prévia do impacto.

## Branches

### `homologacao`

Branch de desenvolvimento e validação.

### `main`

Branch de produção.

Mudanças devem seguir o fluxo controlado entre os ambientes.

## Projeto

Mentoria Garimpo Urbano — MGU
