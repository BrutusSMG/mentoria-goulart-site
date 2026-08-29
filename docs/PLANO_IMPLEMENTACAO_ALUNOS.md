# Plano de implementação do portal de alunos

**Projeto:** Garimpo Urbano  
**Repositório:** `BrutusSMG/mentoria-goulart-site`  
**Fluxo de desenvolvimento:** `homologacao` local → homologação online → `main`/produção  
**Estado desta documentação:** revisado para o branch de homologação existente.

## Objetivo

Implementar uma área própria para alunos no subdomínio `aluno.mentoriagarimpourbano.com.br`. Um novo lead que comprar um dos dois cursos elegíveis — curso com mentoria ou curso sem mentoria — deverá ser convertido em aluno, receber acesso local com usuário e senha e visualizar páginas internas do Garimpo Urbano.

Os alunos que já estão matriculados também deverão ter conta local, mas a migração dessas contas será realizada em uma onda posterior. O acesso às aulas continuará sendo feito na Hotmart, que permanece responsável pela conta do comprador e pelo conteúdo hospedado no Hotmart Club. O portal próprio terá perfil, materiais complementares, suporte e comunidade.

## Regra de ambientes

O código será desenvolvido e testado primeiro no branch local `homologacao`. Nenhuma alteração será enviada para homologação online antes de passar pelos testes locais e pela revisão funcional. A homologação online será usada para validar o comportamento com as variáveis, banco, domínio e integrações do ambiente de teste. Somente depois da aprovação da homologação online será preparada a promoção para `main`, que representa produção.

| Ambiente | Branch ou referência | Finalidade | Pode receber dados reais? |
|---|---|---|---|
| Desenvolvimento local | `homologacao` local | Implementar, testar e revisar cada onda | Não; usar banco/credenciais de teste sempre que possível |
| Homologação online | Branch `homologacao` no remoto, publicado pela hospedagem | Validar build, domínio, banco, e-mails e webhook em ambiente controlado | Somente dados de teste autorizados |
| Produção | `main` | Operação real do site e dos alunos | Sim |

A promoção entre ambientes deverá ser feita por commits revisados. O branch `homologacao` local já foi criado a partir de `origin/homologacao` e está acompanhando o branch remoto existente. O branch remoto contém uma implementação anterior da Jornada do Aluno, que será preservada e documentada como funcionalidade distinta do futuro portal autenticado.

## Estado atual da base de homologação

O branch `homologacao` já contém a Jornada do Aluno, com formulário público, persistência de contribuições vinculadas ao `Lead`, triagem administrativa e permissões específicas para o módulo Jornada. Ele também possui login unificado para o painel administrativo e uma migração baseline versionada. Porém, ainda não existe o modelo `Aluno`, matrícula, login de estudante, perfil privado ou comunidade autenticada.

Essa distinção é essencial: a rota pública `/jornada-do-aluno` coleta informações e relatos de pessoas relacionadas ao curso; ela não representa a área privada do estudante e não deve ser usada como login ou como prova de matrícula.

## Ondas de implementação

| Onda | Branch de trabalho | Escopo | Critério de avanço |
|---|---|---|---|
| 0 — Preparação | `homologacao` local | Registrar decisões, conferir branch, ambiente, domínio, produtos e deploy | Checklist documentado e pendências externas identificadas |
| 1 — Modelo de dados | `homologacao` local | Criar `Aluno`, `Matricula`, tokens de acesso e perfil compartilhável | Schema, migração e testes locais aprovados |
| 2 — Autenticação | `homologacao` local | Login, primeiro acesso, recuperação de senha e sessão de aluno | Fluxo local de credencial aprovado sem afetar admin |
| 3 — Conversão | `homologacao` local | Webhook cria/ativa aluno e matrícula para novos compradores | Eventos aprovados e repetidos processados corretamente |
| 4 — Portal | `homologacao` local | Subdomínio, layout protegido, perfil, comunidade e link Hotmart | Aluno acessa somente páginas autorizadas |
| 5 — Administração | `homologacao` local | Gestão de alunos, matrículas e permissões exclusiva de `ADMIN` | Casos de autorização testados |
| 6 — Migração | `homologacao` local | Importar alunos já matriculados e enviar convites | Backfill revisado e sem duplicidade |
| 7 — Homologação e produção | remoto → `main` | Validar online e promover após aprovação | Checklist de release concluído |

## Onda 0 — preparação

A Onda 0 não implementa ainda o login do aluno nem altera o webhook de conversão. Ela estabelece a base para que as próximas mudanças sejam feitas no branch correto e com separação entre ambientes.

As decisões de negócio já confirmadas são as seguintes: o portal usará o subdomínio `aluno`; somente o curso com mentoria e o curso sem mentoria concederão acesso; o perfil será privado por padrão e terá um botão explícito para compartilhar; somente `ADMIN` concederá permissões e administrará contas e matrículas; e os alunos legados serão migrados posteriormente.

A verificação local encontrou `origin/main` no commit `0617387` e `origin/homologacao` no commit `fcc19d0`. O branch de homologação já contém commits de Jornada do Aluno e deve ser usado como base de implementação, em vez de criar uma nova linha paralela a partir de `main`.

O domínio principal está publicado na Vercel. O subdomínio `aluno.mentoriagarimpourbano.com.br` ainda não resolve no DNS. A configuração deverá ser feita na hospedagem, adicionando o subdomínio ao mesmo projeto ou ao projeto definido para o portal e usando exatamente o destino DNS informado pela Vercel. Não será adivinhado um alvo DNS fixo antes de consultar o painel da hospedagem.

O site atualmente mostra “Área do Aluno” e aponta diretamente para o Hotmart Club. Essa ligação deverá ser substituída somente quando o portal próprio estiver pronto; durante a transição, é possível manter um fallback claro para a Hotmart.

## Onda 1 — modelo de dados

A primeira onda de código deverá criar a base de domínio sem alterar o login, o webhook ou as páginas públicas. O núcleo será formado por `Aluno`, `Matricula`, `AlunoAccessToken` e `PerfilAluno`.

`Aluno` representará a conta local do estudante e armazenará o hash da senha local. `Matricula` representará o direito a um produto elegível. `AlunoAccessToken` permitirá primeiro acesso e recuperação de senha por token de uso único. `PerfilAluno` armazenará os campos que o estudante poderá escolher compartilhar.

A relação entre `Lead` e `Aluno` deverá ser opcional e única por lead. A relação entre aluno e produto deverá impedir matrículas duplicadas. A relação entre `HotmartTransaction`, `Aluno` e `Matricula` deverá ser opcional para preservar transações históricas e permitir backfill posterior.

## Autenticação e Hotmart

O login local do aluno será separado do login administrativo por um campo explícito de contexto, como `tipoConta = ALUNO` ou `ADMIN`. O `role` atual continuará reservado para `ADMIN`, `PARCEIRO` e `FORNECEDOR`.

O aluno usará o e-mail da compra para criar uma senha local e acessar o portal. Para assistir às aulas, ele usará o botão “Assistir às aulas na Hotmart”, que abrirá `https://consumer.hotmart.com`. O portal não deverá solicitar, copiar ou armazenar a senha da Hotmart.

A Hotmart poderá ser integrada posteriormente por API para consulta de alunos ou progresso, mas a autenticação da conta Hotmart continuará sendo feita pela própria plataforma. Essa integração não deve ser confundida com login único entre os dois sistemas.[1] [2] [3]

## Administração

Somente `ADMIN` poderá criar usuários administrativos, conceder permissões, visualizar a lista completa de alunos, alterar matrículas e atuar sobre contas de estudantes. O branch de homologação já possui uma camada de autorização que diferencia `ADMIN` de parceiros autorizados para módulos específicos.[4]

A regra não precisa remover imediatamente os acessos operacionais já concedidos a `PARCEIRO`. Ela precisa garantir que esses perfis não possam conceder permissões, gerir alunos ou administrar matrículas. A nova API de alunos deverá exigir autorização equivalente a `obterAcessoAdmin()`.

## Perfil compartilhável

O perfil será privado por padrão. O aluno preencherá seus dados em uma página privada e ativará um botão “Compartilhar meu perfil” quando desejar aparecer para outros alunos. Campos como nome de exibição, foto, cidade/estado, biografia, experiência e objetivos poderão ser controlados individualmente.

E-mail de login, senha, endereço, documentos, dados de pagamento, telefone e dados do CRM não serão expostos por padrão. A API de comunidade deverá montar no servidor um objeto público filtrado pelas preferências de visibilidade do aluno.

## Migração de alunos legados

A migração dos alunos já matriculados ocorrerá depois de o login local estar validado. A origem será uma lista autorizada ou uma fonte de transações/matrículas confirmadas. Cada aluno será localizado por e-mail normalizado, evitando duplicidade.

O sistema criará a conta local com estado `PENDENTE_ACESSO`, criará ou associará a matrícula e enviará um convite de primeiro acesso. Nenhuma senha será importada, exibida ou conhecida pela equipe. Casos sem e-mail, e-mails divergentes ou produtos não identificados deverão aparecer em relatório para tratamento manual.

## Validação local

Cada onda deverá ser validada no branch local `homologacao` antes de qualquer push. A validação mínima inclui lint, build, geração do Prisma Client, testes de rotas e revisão visual das páginas afetadas. Quando houver banco envolvido, deve-se usar um banco de homologação local ou de teste; nenhuma migração deverá ser aplicada ao banco de produção durante o desenvolvimento.

O script de build atual do branch executa `prisma generate && next build`, sem alterar automaticamente o banco. Migrações deverão ser aplicadas deliberadamente no ambiente correspondente, com revisão do SQL e backup antes de qualquer alteração compartilhada.[5]

## Envio para homologação online

Depois da aprovação local, os commits da onda serão enviados para o branch remoto `homologacao`. A hospedagem deverá gerar a versão de homologação a partir desse branch, ou o fluxo equivalente configurado no projeto. A validação online deverá cobrir domínio/subdomínio, variáveis de ambiente, sessão, banco, envio de e-mails, webhooks de teste, links Hotmart e permissões.

O envio para homologação online não significa promoção para produção. A versão online deverá ser aprovada funcionalmente antes que qualquer merge ou promoção para `main` seja preparado.

## Promoção para produção

A promoção será realizada somente após o checklist de homologação online estar completo. O caminho recomendado é abrir um pull request de `homologacao` para `main`, revisar arquivos, migrações, variáveis e comportamento, e então fazer o merge com aprovação explícita.

A produção deverá receber primeiro a migração de banco compatível com a versão, depois o código da aplicação. A ativação de novos fluxos, como criação automática de alunos, deverá ser gradual quando houver risco de impacto em compradores existentes. O rollback deverá considerar código e banco; migrações destrutivas não serão incluídas sem plano específico.

## Próxima etapa

A documentação da Onda 0 está concluída. A próxima onda técnica é a **Onda 1 — Modelo de dados**, executada exclusivamente no branch local `homologacao`. Ela não deverá alterar ainda a autenticação administrativa, o webhook Hotmart ou o link público da Área do Aluno.

## Referências

[1]: https://help.hotmart.com/pt-br/article/215827338/como-acesso-o-produto-que-comprei-na-hotmart- "Hotmart — Como acesso o produto que comprei?"
[2]: https://help.hotmart.com/pt-br/article/39413024793613/quais-sao-as-opc-es-de-login-para-acessar-minha-conta-na-hotmart- "Hotmart — Opções de login"
[3]: https://developers.hotmart.com/docs/en/start/app-auth/ "Hotmart Developers — App Authentication"
[4]: https://github.com/BrutusSMG/mentoria-goulart-site/blob/homologacao/src/lib/admin-permissoes.js "Camada de permissões no branch de homologação"
[5]: https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate "Prisma — Deploying database changes with Prisma Migrate"
