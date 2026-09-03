# qa-api-swagger

Projeto de testes automatizados de API, com foco em documentação de contrato
via **OpenAPI/Swagger**. A API sob teste é a [GoRest](https://gorest.co.in/),
um serviço público de testes com um recurso REST completo de usuários, posts,
comments e todos.

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

## Estrutura

```
openapi/    especificação OpenAPI dos recursos testados
src/        cliente HTTP usado pelos testes Jest
tests/      casos de teste (Jest)
postman/    collection e environment do Postman/Newman
scripts/    script de execução da collection via Newman
docs/       plano de testes e documentação
.github/    workflow de CI
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

> **Nota de segurança:** o `newman` traz uma dependência transitiva
> (`handlebars`, via `postman-runtime`) com uma vulnerabilidade conhecida
> reportada pelo `npm audit`. É a versão mais recente disponível do pacote;
> o risco é aceito aqui porque o `newman` roda só localmente/no CI, como
> devDependency, contra uma API pública de teste - não em produção.

## CI/CD

Todo push e pull request para `main` dispara um workflow que:

1. Valida a especificação OpenAPI (`swagger-cli validate`).
2. Roda o lint (`eslint`).
3. Executa a suíte de testes (`jest`).
4. Executa a coleção Postman via Newman, restrita às pastas de leitura (para
   não duplicar carga de escrita no sandbox público da GoRest a cada
   execução - a cobertura de escrita já é validada pelos testes Jest).

Pull requests exigem esses checks passando, mas o merge é sempre manual -
não há auto-merge configurado neste repositório.

## Outro projeto relacionado

Para testes de API sobre o [restful-booker](https://restful-booker.herokuapp.com/),
veja o repositório correspondente no meu perfil do GitHub.
