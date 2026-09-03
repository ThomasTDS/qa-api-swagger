# Plano de testes - Recursos Users e Posts (GoRest)

API sob teste: `https://gorest.co.in/public/v2` (GoRest, API pública de terceiros).
Contrato de referência: [`openapi/gorest-openapi.yaml`](../openapi/gorest-openapi.yaml).

Este documento lista os casos de teste implementados nesta primeira etapa do
projeto. Novos casos serão adicionados incrementalmente conforme o projeto
evolui (ver seção "Próximos passos").

## Casos implementados - Users

| ID     | Endpoint            | Cenário                                                              | Tipo     | Resultado esperado                          | Arquivo                                                    |
| ------ | -------------------- | --------------------------------------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------------------------------- |
| TC-001 | GET /users            | Listar usuários na primeira página                                    | Positivo | 200 + lista não vazia                        | [users.get.positive.test.js](../tests/users.get.positive.test.js) |
| TC-002 | GET /users            | Cada usuário da lista possui os campos obrigatórios                   | Positivo | Todos os itens têm id/name/email/gender/status válidos | [users.get.positive.test.js](../tests/users.get.positive.test.js) |
| TC-003 | GET /users            | Filtrar usuários por `gender=female`                                  | Positivo | 200 + todos os itens com gender="female"      | [users.get.positive.test.js](../tests/users.get.positive.test.js) |
| TC-004 | GET /users/{id}       | Buscar um usuário existente por ID                                    | Positivo | 200 + dados batendo com o usuário esperado     | [users.get.positive.test.js](../tests/users.get.positive.test.js) |
| TC-005 | GET /users/{id}       | Buscar um ID inexistente (ex.: `1`)                                    | Negativo | 404 + `{"message":"Resource not found"}`        | [users.get.negative.test.js](../tests/users.get.negative.test.js) |
| TC-006 | GET /users/{id}       | Buscar um ID em formato inválido (ex.: `abc`)                          | Negativo | 404 (ver defeito documentado - issue #1)        | [users.get.negative.test.js](../tests/users.get.negative.test.js) |
| TC-007 | GET /users            | Paginar muito além do total de registros existentes                    | Negativo/borda | 200 + lista vazia                          | [users.get.negative.test.js](../tests/users.get.negative.test.js) |
| TC-008 | GET /users            | Filtrar por `gender` com valor fora do enum (ex.: `alien`)              | Negativo | 200 + lista vazia (ver defeito documentado - issue #2) | [users.get.negative.test.js](../tests/users.get.negative.test.js) |
| TC-009 | POST /users           | Criar usuário sem enviar token de autenticação                         | Negativo | 401 + `{"message":"Authentication failed"}`     | [users.get.negative.test.js](../tests/users.get.negative.test.js) |

Todos os testes que retornam corpo de resposta compatível com o contrato
também são validados contra a especificação OpenAPI via `jest-openapi`
(`expect(res).toSatisfyApiSpec()`).

## Casos autenticados (escrita) - Users

Exigem um token pessoal do GoRest na variável de ambiente `GOREST_TOKEN`
(local via `.env`, ou secret `GOREST_TOKEN` no repositório para o CI). Sem o
token, estes testes são pulados automaticamente (`describe.skip`) para não
quebrar o pipeline.

| ID     | Endpoint       | Cenário                                                    | Tipo     | Resultado esperado                                    | Arquivo                                                        |
| ------ | -------------- | ------------------------------------------------------------- | -------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| TC-010 | POST /users     | Criar um usuário com dados válidos                             | Positivo | 201 + usuário criado com os dados enviados                 | [users.write.positive.test.js](../tests/users.write.positive.test.js) |
| TC-011 | PUT /users/{id} | Atualizar um usuário existente                                 | Positivo | 200 + campo atualizado refletido na resposta                | [users.write.positive.test.js](../tests/users.write.positive.test.js) |
| TC-012 | DELETE /users/{id} | Remover um usuário existente                                | Positivo | 204, e um GET subsequente no mesmo ID retorna 404            | [users.write.positive.test.js](../tests/users.write.positive.test.js) |
| TC-013 | POST /users     | Criar usuário sem o campo obrigatório `name`                   | Negativo | 422 + erro de validação apontando o campo `name`             | [users.write.negative.test.js](../tests/users.write.negative.test.js) |
| TC-014 | POST /users     | Criar usuário com `email` em formato inválido                  | Negativo | 422 + erro de validação apontando o campo `email`            | [users.write.negative.test.js](../tests/users.write.negative.test.js) |
| TC-015 | POST /users     | Criar usuário com `email` já cadastrado                        | Negativo | 422 + erro de validação indicando email duplicado            | [users.write.negative.test.js](../tests/users.write.negative.test.js) |
| TC-016 | PUT /users/{id} | Atualizar um ID inexistente                                    | Negativo | 404                                                        | [users.write.negative.test.js](../tests/users.write.negative.test.js) |
| TC-017 | DELETE /users/{id} | Remover um ID inexistente                                   | Negativo | 404                                                        | [users.write.negative.test.js](../tests/users.write.negative.test.js) |

Cada teste de escrita que cria dados remove o que criou ao final (a GoRest é
um sandbox público compartilhado entre todos os usuários da ferramenta).

Os 8 casos acima (TC-010 a TC-017) foram executados com sucesso contra a API
real após a configuração do token, confirmando o formato de erro
`[{"field":..., "message":...}]` usado nas asserções.

## Casos implementados - Posts

O recurso Posts é vinculado a um usuário (`user_id`). Os testes de leitura
não exigem token; os de escrita, sim.

| ID     | Endpoint               | Cenário                                                    | Tipo     | Resultado esperado                                | Arquivo                                                        |
| ------ | ---------------------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| TC-018 | GET /posts              | Listar posts na primeira página                                   | Positivo | 200 + lista não vazia                                   | [posts.get.positive.test.js](../tests/posts.get.positive.test.js)     |
| TC-019 | GET /posts/{id}         | Buscar um post existente por ID                                   | Positivo | 200 + dados batendo com o post esperado                  | [posts.get.positive.test.js](../tests/posts.get.positive.test.js)     |
| TC-020 | GET /users/{id}/posts   | Listar os posts de um usuário específico (endpoint aninhado)      | Positivo | 200 + todos os itens com o `user_id` informado            | [posts.get.positive.test.js](../tests/posts.get.positive.test.js)     |
| TC-021 | GET /posts/{id}         | Buscar um ID inexistente (ex.: `1`)                                | Negativo | 404 + `{"message":"Resource not found"}`                  | [posts.get.negative.test.js](../tests/posts.get.negative.test.js)     |
| TC-022 | GET /posts/{id}         | Buscar um ID em formato inválido (ex.: `abc`)                      | Negativo | 404                                                    | [posts.get.negative.test.js](../tests/posts.get.negative.test.js)     |
| TC-023 | POST /posts             | Criar post sem enviar token de autenticação                       | Negativo | 401 + `{"message":"Authentication failed"}`               | [posts.get.negative.test.js](../tests/posts.get.negative.test.js)     |
| TC-024 | POST /posts             | Criar um post com dados válidos                                   | Positivo | 201 + post criado com os dados enviados                  | [posts.write.positive.test.js](../tests/posts.write.positive.test.js) |
| TC-025 | PUT /posts/{id}         | Atualizar um post existente                                       | Positivo | 200 + campo atualizado refletido na resposta              | [posts.write.positive.test.js](../tests/posts.write.positive.test.js) |
| TC-026 | DELETE /posts/{id}      | Remover um post existente                                         | Positivo | 204, e um GET subsequente no mesmo ID retorna 404          | [posts.write.positive.test.js](../tests/posts.write.positive.test.js) |
| TC-027 | POST /posts             | Criar post sem o campo obrigatório `title`                        | Negativo | 422 + erro de validação apontando o campo `title`         | [posts.write.negative.test.js](../tests/posts.write.negative.test.js) |
| TC-028 | POST /posts             | Criar post com `user_id` que não corresponde a um usuário existente | Negativo | 422 + `{"field":"user","message":"must exist"}`          | [posts.write.negative.test.js](../tests/posts.write.negative.test.js) |
| TC-029 | PUT /posts/{id}         | Atualizar um ID inexistente                                       | Negativo | 404                                                    | [posts.write.negative.test.js](../tests/posts.write.negative.test.js) |
| TC-030 | DELETE /posts/{id}      | Remover um ID inexistente                                         | Negativo | 404                                                    | [posts.write.negative.test.js](../tests/posts.write.negative.test.js) |

Todos os 13 casos (TC-018 a TC-030) foram executados com sucesso contra a API
real, incluindo os autenticados.

## Coleção Postman / Newman

A coleção [`postman/gorest.postman_collection.json`](../postman/gorest.postman_collection.json)
espelha os cenários acima de Users e Posts, organizados em quatro pastas:

- `Users - Leitura (sem autenticação)` e `Posts - Leitura (sem autenticação)`:
  não exigem token. São as pastas executadas no CI
  (`npm run postman:run:read-only`).
- `Users - Escrita (autenticado)` e `Posts - Escrita (autenticado)`:
  encadeiam variáveis de coleção entre requisições (ex.: usa o usuário/post
  criado para depois atualizar e remover). Executadas localmente com
  `npm run postman:run` quando `GOREST_TOKEN` está disponível.

Executada e validada localmente: 22 requisições, 38 asserções, 0 falhas.

## Próximos passos

- Ampliar a especificação OpenAPI e os testes (Jest e Postman) para os
  recursos restantes da GoRest (comments, todos).
