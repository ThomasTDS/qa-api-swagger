# qa-api-swagger

Projeto de testes automatizados de API, com foco em documentação de contrato
via **OpenAPI/Swagger**. A API sob teste é a [GoRest](https://gorest.co.in/),
um serviço público de testes com um recurso REST completo de usuários, posts,
comments e todos.

**Swagger UI publicado:** https://thomastds.github.io/qa-api-swagger/

Este repositório é construído de forma incremental: começa com um conjunto
pequeno de testes e cresce ao longo do tempo, cobrindo mais endpoints,
cenários e ferramentas.

## Objetivo

Demonstrar, na prática:

- Escrita de especificação **OpenAPI 3.0** a partir da observação do
  comportamento real de uma API (a GoRest não publica uma spec oficial).
- Testes de API automatizados com **Jest**, cobrindo cenários **positivos e
  negativos**.
- Validação de contrato (**contract testing**): as respostas da API são
  checadas contra a especificação OpenAPI em tempo de execução, via
  `jest-openapi`.
- **CI/CD** com GitHub Actions, validando a spec, o lint e os testes em todo
  push e pull request.
- Documentação de casos de teste ([`docs/test-plan.md`](docs/test-plan.md)) e
  de defeitos observados na API sob teste (issues do repositório).
- Uma coleção **Postman**, gerada a partir da mesma especificação OpenAPI e
  executada via **Newman**, como forma alternativa de rodar os testes de
  contrato.
- Uma instância do **Swagger UI** publicada via GitHub Pages, renderizando a
  especificação diretamente do repositório.
- Testes orientados a schema com **Schemathesis** (*property-based
  testing*), gerando casos de teste automaticamente a partir da spec
  OpenAPI - já encontrou e documentou defeitos reais na API sob teste.
- Relatórios de teste em **HTML**, gerados a cada execução do Jest e do
  Newman e publicados como artefato do CI.

## Estrutura

```
openapi/       especificação OpenAPI dos recursos testados
src/           cliente HTTP usado pelos testes Jest
tests/         casos de teste (Jest)
postman/       collection e environment do Postman/Newman
scripts/       script de execução da collection via Newman
swagger-ui/    página estática do Swagger UI, publicada via GitHub Pages
schema-tests/  testes orientados a schema (Schemathesis)
docs/          plano de testes e documentação
.github/       workflows de CI, deploy do Pages e testes de schema
```

## Como rodar localmente

Pré-requisitos: Node.js 20+.

```bash
npm install
npm run validate:openapi   # valida a especificação OpenAPI
npm run lint                # lint do código
npm test                    # executa os testes
```

Os testes de leitura (`GET`) não exigem token de autenticação. Os testes de
escrita (`POST`/`PUT`/`DELETE`) exigem um token pessoal da GoRest: copie
`.env.example` para `.env` e preencha `GOREST_TOKEN` com um
[token pessoal da GoRest](https://gorest.co.in/my-account/access-tokens).
Sem o token, esses testes são pulados automaticamente, tanto localmente
quanto no CI.

### Postman / Newman

A coleção em [`postman/gorest.postman_collection.json`](postman/gorest.postman_collection.json)
cobre os mesmos cenários dos testes Jest (leitura e escrita, positivos e
negativos), com asserções via scripts de teste do Postman.

```bash
npm run postman:run             # roda tudo; sem GOREST_TOKEN, pula as pastas de escrita
npm run postman:run:read-only   # roda só as pastas de leitura, mesmo com token configurado
```

> **Nota de segurança:** o `newman` e seus reporters (incluindo
> `newman-reporter-htmlextra`) trazem dependências transitivas (ex.:
> `handlebars`, via `postman-runtime`) com vulnerabilidades conhecidas
> reportadas pelo `npm audit`. São as versões mais recentes disponíveis dos
> pacotes; o risco é aceito aqui porque rodam só localmente/no CI, como
> devDependency, contra uma API pública de teste - não em produção.

## Swagger UI

A especificação em `openapi/gorest-openapi.yaml` é renderizada ao vivo em
https://thomastds.github.io/qa-api-swagger/, via [Swagger UI](https://swagger.io/tools/swagger-ui/).
A página (`swagger-ui/index.html`) carrega o Swagger UI por CDN e aponta para
o arquivo da spec direto no branch `main` do repositório - qualquer merge que
altere a spec atualiza a documentação publicada automaticamente, via o
workflow [`pages.yml`](.github/workflows/pages.yml).

## Testes orientados a schema (Schemathesis)

Além dos testes escritos manualmente, [`schema-tests/`](schema-tests/) usa o
[Schemathesis](https://schemathesis.readthedocs.io/) para gerar casos de
teste automaticamente a partir de `openapi/gorest-openapi.yaml`, via
*property-based testing* - útil para achar combinações de entrada que não
foram pensadas manualmente.

```bash
pip install -r schema-tests/requirements.txt
bash schema-tests/run.sh
```

Restrito de propósito a operações `GET`, com poucos exemplos por operação e
rate limit conservador, para não gerar carga de escrita nem estourar limites
no sandbox público da GoRest. Roda semanalmente e sob demanda via
[`schema-tests.yml`](.github/workflows/schema-tests.yml) - não em todo
push/PR, porque tende a encontrar comportamentos permanentes da API de
terceiros (não regressões deste repositório), e não faz sentido um check que
falha sempre por um motivo fora do nosso controle.

Já encontrou e confirmou defeitos reais: reforçou a [issue #3](https://github.com/ThomasTDS/qa-api-swagger/issues/3)
(filtros com valor fora do enum aceitos silenciosamente) e descobriu a
[issue #9](https://github.com/ThomasTDS/qa-api-swagger/issues/9) (respostas
405 sem o header `Allow` exigido pela RFC 9110).

## Relatórios de teste (HTML)

Tanto `npm test` quanto `npm run postman:run`/`postman:run:read-only` geram
relatórios em HTML localmente, em `reports/` (pasta ignorada pelo git):

- `reports/jest/index.html` - via [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters).
- `reports/newman/index.html` - via [newman-reporter-htmlextra](https://github.com/DannyDainton/newman-reporter-htmlextra).

O header `Authorization` é explicitamente omitido do relatório do Newman
(`skipHeaders` em [`scripts/run-newman.js`](scripts/run-newman.js)), para que
o token real nunca apareça no HTML gerado, mesmo rodando a suíte completa
autenticada localmente.

No CI, esses relatórios são publicados como artefato (`test-reports`) a cada
execução - inclusive quando os testes falham, o que ajuda a depurar o motivo
de uma falha diretamente pelo GitHub Actions, sem precisar reproduzir
localmente.

## CI/CD

Todo push e pull request para `main` dispara um workflow que:

1. Valida a especificação OpenAPI (`swagger-cli validate`).
2. Roda o lint (`eslint`).
3. Executa a suíte de testes (`jest`).
4. Executa a coleção Postman via Newman, restrita às pastas de leitura (para
   não duplicar carga de escrita no sandbox público da GoRest a cada
   execução - a cobertura de escrita já é validada pelos testes Jest).
5. Publica os relatórios HTML gerados como artefato do workflow.

Pull requests exigem esses checks passando, mas o merge é sempre manual -
não há auto-merge configurado neste repositório.

## Outro projeto relacionado

Para testes de API sobre o [restful-booker](https://restful-booker.herokuapp.com/),
veja o repositório correspondente no meu perfil do GitHub.
