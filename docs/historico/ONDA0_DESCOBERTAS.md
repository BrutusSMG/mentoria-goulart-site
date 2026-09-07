# Onda 0 — descobertas e estado dos ambientes

**Projeto:** Garimpo Urbano  
**Branch local ativo:** `homologacao`  
**Branch remoto acompanhado:** `origin/homologacao`  
**Commit-base atual:** `fcc19d0` — `chore: evitar alteracao automatica do banco no build`

## Branches identificados

| Referência | Estado | Uso definido |
|---|---|---|
| `main` / `origin/main` | Commit `0617387` | Base de produção. |
| `homologacao` local | Criado a partir de `origin/homologacao` e configurado para acompanhá-lo | Desenvolvimento e validação local das ondas. |
| `origin/homologacao` | Commit `fcc19d0` | Homologação online após validação local e push controlado. |
| `feat/onda-0-aluno-preparacao` | Branch temporário anterior | Não será usado como base de implementação; serviu apenas para documentação inicial. |

O branch de homologação já contém a funcionalidade chamada “Jornada do Aluno”. Ela consiste em um formulário público de contribuição/escuta, persistência em `JornadaContribuicao`, triagem administrativa e permissões do módulo Jornada. Essa funcionalidade não é o portal privado autenticado do aluno e será preservada como um domínio separado.

## Estado funcional do branch `homologacao`

O schema atual ainda não possui `Aluno`, `Matricula`, `AlunoAccessToken` ou `PerfilAluno`. A autenticação atual consulta `AdminUser` e serve ao painel administrativo. A página pública `/jornada-do-aluno` coleta informações de leads e contribuições, mas não cria conta de estudante.

O branch já possui uma migração baseline e migrações específicas da Jornada do Aluno. O `package.json` atual executa `prisma generate && next build`, sem executar `prisma db push` durante o build. Isso mantém a alteração do banco separada do processo de compilação.

## Domínio e publicação

O domínio principal `https://www.mentoriagarimpourbano.com.br` está publicado na Vercel. O subdomínio `https://aluno.mentoriagarimpourbano.com.br` ainda não resolve no DNS. A associação deverá ser feita no painel da hospedagem, adicionando o subdomínio ao projeto adequado e usando o destino DNS exibido pela própria Vercel.

Atualmente, o link “Área do Aluno” do site aponta diretamente para o Hotmart Club. Esse link será mantido como referência/fallback até que o portal próprio esteja implementado e validado na homologação online.

## Decisões confirmadas

- O portal próprio usará o subdomínio `aluno`.
- Somente o curso com mentoria e o curso sem mentoria concederão acesso ao portal.
- O perfil do aluno será privado por padrão e terá um botão explícito de compartilhamento.
- Somente `ADMIN` concederá permissões, gerenciará contas administrativas, alunos e matrículas.
- Parceiros podem manter acesso a módulos operacionais já autorizados, mas não podem conceder permissões nem administrar alunos.
- Alunos já matriculados serão migrados em etapa posterior.
- Aulas continuarão na Hotmart; o portal não armazenará senha da Hotmart.
- A ordem de promoção será: branch local `homologacao` → branch remoto/homologação online → `main`/produção.

## Pendências externas da Onda 0

| Pendência | Responsável/ação | Bloqueia a Onda 1? |
|---|---|---:|
| Configurar o subdomínio `aluno` na hospedagem | Adicionar o domínio ao projeto e criar o registro DNS indicado pela Vercel | Não para criar o schema; sim para testar o portal online |
| Confirmar os IDs numéricos dos dois produtos Hotmart | Consultar a conta Hotmart e registrar os IDs em configuração de homologação | Sim para fechar a regra de matrícula automática |
| Definir ambiente de banco de homologação | Usar banco separado ou instância de teste | Sim para aplicar e testar migrações online |
| Confirmar remetente de e-mail | Validar domínio/remetente do Resend para convites e recuperação | Não para o schema; sim para testar primeiro acesso |
| Definir fallback da Área do Aluno | Manter link Hotmart até o portal próprio ser aprovado | Não |

## Histórico local desta preparação

A documentação foi refeita diretamente no branch local `homologacao`. Nenhum arquivo funcional da aplicação foi alterado nesta etapa; as mudanças desta Onda 0 são documentais e serão versionadas antes da implementação da Onda 1.
