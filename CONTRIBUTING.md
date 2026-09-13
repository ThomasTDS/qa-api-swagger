# Contribuindo

Este documento descreve como este repositório é organizado no dia a dia:
como configurar o ambiente, o fluxo de branches e PRs, e os padrões usados
nos commits. Serve tanto para quem for propor uma contribuição quanto como
referência de como o projeto é mantido.

## Configurando o ambiente

Pré-requisitos: Node.js 20+ (ver `.github/workflows/ci.yml` para a versão
exata usada no CI) e, opcionalmente, Python 3.12+ para os testes orientados
a schema (`schema-tests/`).

```bash
npm install
cp .env.example .env   # preencha GOREST_TOKEN se for rodar os testes de escrita
```

`npm install` já configura um hook de pre-commit (husky + lint-staged) que
roda `eslint --fix` nos arquivos `.js` staged antes de cada commit.

Antes de abrir um PR, confirme que passa localmente:

```bash
npm run validate:openapi
npm run lint
npm test
npm run postman:run:read-only   # ou postman:run, com GOREST_TOKEN configurado
```

## Fluxo de branches e PRs

- `main` é a branch protegida: exige PR (não aceita push direto) e o check
  de CI (`lint-and-test`) passando antes de permitir o merge.
- Cada mudança vai para uma branch própria, nomeada com um prefixo que
  indica o tipo de mudança - convenção usada em todo o histórico deste
  repositório:
  - `feat/` - nova funcionalidade (ex.: `feat/posts-resource`)
  - `docs/` - documentação (ex.: `docs/add-contributing`)
  - `ci/` - mudanças de CI/CD (ex.: `ci/add-codecov-coverage`)
  - `chore/` - manutenção/configuração que não é funcionalidade nem CI
    (ex.: `chore/add-precommit-hook`)
- **O merge é sempre manual.** Não há auto-merge configurado neste
  repositório, propositalmente: cada PR é revisado e mergeado individualmente.

## Mensagens de commit

Seguem o padrão `tipo: descrição breve no imperativo`, com mais contexto no
corpo quando necessário (o quê e, principalmente, por quê):

```
feat: adiciona cobertura do recurso Posts (spec, testes Jest e Postman)

Estende a spec OpenAPI com Posts (GET/POST/PUT/DELETE /posts e o
endpoint aninhado GET /users/{id}/posts)...
```

Tipos usados: `feat`, `fix`, `docs`, `ci`, `chore`.

## Testes e defeitos

- Casos de teste ficam documentados em [`docs/test-plan.md`](docs/test-plan.md),
  com um ID (`TC-XXX`) por cenário, mapeado para o arquivo de teste
  correspondente. Ao adicionar um teste novo, adicione a linha
  correspondente na tabela do recurso certo.
- Defeitos observados na API sob teste (não bugs deste repositório) são
  documentados como issues, com passos de reprodução, resultado atual vs.
  esperado, e uma nota deixando claro que é um comportamento de terceiros
  que não pode ser corrigido aqui. Use o template "Defeito observado na API
  sob teste" ao abrir uma issue nova - ele já cobre esses campos.
- PRs usam o template em [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)
  (preenchido automaticamente ao abrir um PR): resumo da mudança e comandos
  de validação local rodados.

## CI/CD

Todo PR roda o workflow [`ci.yml`](.github/workflows/ci.yml): validação da
spec OpenAPI, lint, testes (Jest, com cobertura enviada ao Codecov) e a
coleção Postman via Newman (restrita às pastas de leitura). Os relatórios de
teste em HTML são publicados como artefato do workflow, mesmo quando os
testes falham.

O workflow de testes orientados a schema ([`schema-tests.yml`](.github/workflows/schema-tests.yml))
roda semanalmente e sob demanda, não em todo PR - ver a justificativa em
`docs/test-plan.md`.
