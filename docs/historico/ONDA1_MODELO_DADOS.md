# Onda 1 — modelo de dados do aluno

**Branch:** `homologacao` local  
**Commit-base:** `fcc19d0`  
**Status:** implementada localmente; migração ainda não aplicada a nenhum banco compartilhado.

## Objetivo da onda

Criar a fundação de dados para o portal do aluno sem alterar ainda o login, o webhook Hotmart, a Jornada do Aluno ou as páginas públicas. A Onda 1 prepara as entidades necessárias para que as próximas ondas possam criar credenciais, matrículas, perfis e conversão automática.

## Alterações realizadas

O schema Prisma recebeu quatro enums e quatro modelos novos. `Aluno` representa a conta local do estudante e guarda apenas o hash da senha quando a autenticação for implementada. `Matricula` representa o direito de acesso a um produto. `AlunoAccessToken` será usado para primeiro acesso e recuperação de senha. `PerfilAluno` armazenará os campos que o estudante escolher compartilhar.

O modelo `Lead` recebeu a relação opcional `aluno`, permitindo que um lead seja convertido em uma conta sem remover seu histórico de captação. `HotmartTransaction` recebeu os vínculos opcionais `alunoId` e `matriculaId`, preservando o relacionamento comercial atual e preparando a reconciliação de acesso.

| Entidade | Finalidade | Regra relevante |
|---|---|---|
| `Aluno` | Conta e identidade local do estudante | E-mail único; relação opcional e única com `Lead`; senha somente como hash. |
| `Matricula` | Direito de acesso ao produto | Um aluno não pode ter duas matrículas para o mesmo `produtoId`. |
| `AlunoAccessToken` | Convite, primeiro acesso e recuperação | Apenas hash do token; token único, com expiração e uso controlado. |
| `PerfilAluno` | Perfil privado e compartilhável | Privado por padrão; visibilidade e campos compartilhados serão opt-in. |

## Estados definidos

`Aluno` possui os estados `PENDENTE_ACESSO`, `ATIVO`, `SUSPENSO` e `INATIVO`. `Matricula` possui `PENDENTE`, `ATIVA`, `SUSPENSA`, `CANCELADA` e `ENCERRADA`. A separação permite que um aluno tenha matrícula ativa enquanto ainda não configurou a senha local.

As origens `HOTMART`, `LEGADO` e `MANUAL` foram previstas desde a primeira versão para diferenciar novos compradores, alunos migrados e concessões administrativas. A Onda 1 não cria alunos automaticamente; essa responsabilidade ficará na Onda 3, no fluxo do webhook.

## Migração

Foi gerada a migração:

```text
prisma/migrations/20260826090000_add_aluno_portal/migration.sql
```

A migração cria os enums, tabelas, índices, chaves estrangeiras e campos adicionais em `HotmartTransaction`. Ela foi gerada por comparação entre o schema original de `origin/homologacao` e o schema atualizado, pois não existe um PostgreSQL local disponível nesta sessão.

A migração **não foi aplicada** a nenhum banco. Não foi usado banco remoto, e nenhuma variável real de conexão foi acessada. Antes da homologação online, a migração deverá ser aplicada deliberadamente ao banco de homologação correspondente e validada com dados de teste.

## Validações realizadas

| Validação | Resultado |
|---|---|
| `prisma format` | Aprovado. |
| `prisma validate` | Aprovado usando uma URL PostgreSQL fictícia apenas para validação de configuração. |
| `git diff --check` | Aprovado. |
| `npm run lint` | Aprovado. |
| `npm run build` | Aprovado com variáveis fictícias de compilação; 40 páginas foram geradas e não houve alteração de banco. |
| Aplicação da migração | Pendente, pois não há banco PostgreSQL local configurado. |
| Teste do portal/login de aluno | Ainda não se aplica; será implementado nas Ondas 2 e 4. |

O `npm ci` instalou as dependências do branch e reportou seis vulnerabilidades de alta severidade no conjunto de dependências. Essa análise não executou `npm audit fix`, pois a atualização automática poderia alterar a base da aplicação fora do escopo da Onda 1. O tema deve ser tratado em uma tarefa própria antes da produção.

## Critérios para aprovação da Onda 1

A Onda 1 pode ser considerada tecnicamente aprovada quando a migração for aplicada em um banco de homologação, o Prisma Client for regenerado e for possível confirmar a criação das tabelas sem alterar registros existentes. Também deverá ser validado que o branch continua compilando após a aplicação da migração.

A Onda 1 não deve ser enviada para produção neste momento. O próximo passo é implementar as credenciais locais do aluno no mesmo branch `homologacao`, mantendo o login administrativo atual funcionando.

## Próxima onda

A **Onda 2 — Autenticação do aluno** deverá criar primeiro acesso, definição de senha, login, logout, recuperação de senha e sessão com contexto explícito de `ALUNO`. A sessão do aluno não poderá abrir o painel administrativo, e a sessão administrativa não deverá ser tratada como sessão de estudante.
