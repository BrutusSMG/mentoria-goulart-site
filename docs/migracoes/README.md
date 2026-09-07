# Migrações

Documentação de migrações, backfills e alterações controladas de dados do MGU.

## Documento principal

### `PROCEDIMENTO-MIGRACOES.md`

Define o procedimento mínimo para:

- alterações no `prisma/schema.prisma`;
- criação e revisão de migrações;
- aplicação em homologação;
- promoção para produção;
- migrações destrutivas;
- backfills;
- validação pós-migração.

## Registros específicos

Migrações ou alterações de dados que exijam procedimento especial devem receber um documento próprio nesta pasta.

Formato recomendado:

```text
AAAA-MM-DD-nome-da-alteracao.md
```
