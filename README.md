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

## Estrutura

```
openapi/    especificação OpenAPI do recurso testado
src/        cliente HTTP usado pelos testes
tests/      casos de teste (Jest)
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

Os testes desta primeira etapa cobrem apenas operações de leitura (`GET`) e
**não exigem token de autenticação**. Para rodar cenários autenticados
(quando adicionados), copie `.env.example` para `.env` e preencha
`GOREST_TOKEN` com um [token pessoal da GoRest](https://gorest.co.in/my-account/access-tokens).

## CI/CD

Todo push e pull request para `main` dispara um workflow que:

1. Valida a especificação OpenAPI (`swagger-cli validate`).
2. Roda o lint (`eslint`).
3. Executa a suíte de testes (`jest`).

Pull requests exigem esses checks passando, mas o merge é sempre manual -
não há auto-merge configurado neste repositório.

## Outro projeto relacionado

Para testes de API sobre o [restful-booker](https://restful-booker.herokuapp.com/),
veja o repositório correspondente no meu perfil do GitHub.
