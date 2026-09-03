# Plano de testes - Recursos Users, Posts, Comments e Todos (GoRest)

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

## Casos implementados - Comments

O recurso Comments é vinculado a um post (`post_id`). Os testes de leitura
não exigem token; os de escrita, sim.

| ID     | Endpoint                | Cenário                                                            | Tipo     | Resultado esperado                                | Arquivo                                                              |
| ------ | ------------------------ | --------------------------------------------------------------------- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| TC-031 | GET /comments             | Listar comments na primeira página                                   | Positivo | 200 + lista não vazia                                   | [comments.get.positive.test.js](../tests/comments.get.positive.test.js)   |
| TC-032 | GET /comments/{id}        | Buscar um comment existente por ID                                   | Positivo | 200 + dados batendo com o comment esperado                | [comments.get.positive.test.js](../tests/comments.get.positive.test.js)   |
| TC-033 | GET /posts/{id}/comments  | Listar os comments de um post específico (endpoint aninhado)         | Positivo | 200 + todos os itens com o `post_id` informado             | [comments.get.positive.test.js](../tests/comments.get.positive.test.js)   |
| TC-034 | GET /comments/{id}        | Buscar um ID inexistente (ex.: `1`)                                   | Negativo | 404 + `{"message":"Resource not found"}`                   | [comments.get.negative.test.js](../tests/comments.get.negative.test.js)   |
| TC-035 | GET /comments/{id}        | Buscar um ID em formato inválido (ex.: `abc`)                         | Negativo | 404                                                     | [comments.get.negative.test.js](../tests/comments.get.negative.test.js)   |
| TC-036 | POST /comments            | Criar comment sem enviar token de autenticação                       | Negativo | 401 + `{"message":"Authentication failed"}`                | [comments.get.negative.test.js](../tests/comments.get.negative.test.js)   |
| TC-037 | POST /comments            | Criar um comment com dados válidos                                   | Positivo | 201 + comment criado com os dados enviados                | [comments.write.positive.test.js](../tests/comments.write.positive.test.js) |
| TC-038 | PUT /comments/{id}        | Atualizar um comment existente                                       | Positivo | 200 + campo atualizado refletido na resposta               | [comments.write.positive.test.js](../tests/comments.write.positive.test.js) |
| TC-039 | DELETE /comments/{id}     | Remover um comment existente                                         | Positivo | 204, e um GET subsequente no mesmo ID retorna 404           | [comments.write.positive.test.js](../tests/comments.write.positive.test.js) |
| TC-040 | POST /comments            | Criar comment sem o campo obrigatório `body`                         | Negativo | 422 + erro de validação apontando o campo `body`           | [comments.write.negative.test.js](../tests/comments.write.negative.test.js) |
| TC-041 | POST /comments            | Criar comment com `post_id` que não corresponde a um post existente  | Negativo | 422 + `{"field":"post","message":"must exist"}`            | [comments.write.negative.test.js](../tests/comments.write.negative.test.js) |
| TC-042 | PUT /comments/{id}        | Atualizar um ID inexistente                                          | Negativo | 404                                                     | [comments.write.negative.test.js](../tests/comments.write.negative.test.js) |
| TC-043 | DELETE /comments/{id}     | Remover um ID inexistente                                            | Negativo | 404                                                     | [comments.write.negative.test.js](../tests/comments.write.negative.test.js) |

Todos os 13 casos (TC-031 a TC-043) foram executados com sucesso contra a API
real, incluindo os autenticados.

## Casos implementados - Todos

O recurso Todos é vinculado a um usuário (`user_id`) e possui um campo
`status` restrito ao enum `pending`/`completed`. Os testes de leitura não
exigem token; os de escrita, sim.

| ID     | Endpoint             | Cenário                                                          | Tipo     | Resultado esperado                                | Arquivo                                                        |
| ------ | --------------------- | --------------------------------------------------------------------- | -------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| TC-044 | GET /todos             | Listar todos na primeira página                                       | Positivo | 200 + lista não vazia                                   | [todos.get.positive.test.js](../tests/todos.get.positive.test.js)     |
| TC-045 | GET /todos/{id}        | Buscar um todo existente por ID                                       | Positivo | 200 + dados batendo com o todo esperado                  | [todos.get.positive.test.js](../tests/todos.get.positive.test.js)     |
| TC-046 | GET /users/{id}/todos  | Listar os todos de um usuário específico (endpoint aninhado)          | Positivo | 200 + todos os itens com o `user_id` informado            | [todos.get.positive.test.js](../tests/todos.get.positive.test.js)     |
| TC-047 | GET /todos/{id}        | Buscar um ID inexistente (ex.: `1`)                                    | Negativo | 404 + `{"message":"Resource not found"}`                   | [todos.get.negative.test.js](../tests/todos.get.negative.test.js)     |
| TC-048 | GET /todos/{id}        | Buscar um ID em formato inválido (ex.: `abc`)                          | Negativo | 404                                                     | [todos.get.negative.test.js](../tests/todos.get.negative.test.js)     |
| TC-049 | POST /todos            | Criar todo sem enviar token de autenticação                           | Negativo | 401 + `{"message":"Authentication failed"}`                | [todos.get.negative.test.js](../tests/todos.get.negative.test.js)     |
| TC-050 | POST /todos            | Criar um todo com dados válidos                                       | Positivo | 201 + todo criado com os dados enviados                   | [todos.write.positive.test.js](../tests/todos.write.positive.test.js) |
| TC-051 | PUT /todos/{id}        | Atualizar o status de um todo existente                               | Positivo | 200 + status atualizado refletido na resposta              | [todos.write.positive.test.js](../tests/todos.write.positive.test.js) |
| TC-052 | DELETE /todos/{id}     | Remover um todo existente                                             | Positivo | 204, e um GET subsequente no mesmo ID retorna 404           | [todos.write.positive.test.js](../tests/todos.write.positive.test.js) |
| TC-053 | POST /todos            | Criar todo sem o campo obrigatório `title`                            | Negativo | 422 + erro de validação apontando o campo `title`          | [todos.write.negative.test.js](../tests/todos.write.negative.test.js) |
| TC-054 | POST /todos            | Criar todo com `status` fora do enum permitido                        | Negativo | 422 + erro de validação apontando o campo `status`         | [todos.write.negative.test.js](../tests/todos.write.negative.test.js) |
| TC-055 | POST /todos            | Criar todo com `user_id` que não corresponde a um usuário existente   | Negativo | 422 + `{"field":"user","message":"must exist"}`            | [todos.write.negative.test.js](../tests/todos.write.negative.test.js) |
| TC-056 | PUT /todos/{id}        | Atualizar um ID inexistente                                           | Negativo | 404                                                     | [todos.write.negative.test.js](../tests/todos.write.negative.test.js) |
| TC-057 | DELETE /todos/{id}     | Remover um ID inexistente                                             | Negativo | 404                                                     | [todos.write.negative.test.js](../tests/todos.write.negative.test.js) |

Todos os 14 casos (TC-044 a TC-057) foram executados com sucesso contra a API
real, incluindo os autenticados.

## Coleção Postman / Newman

A coleção [`postman/gorest.postman_collection.json`](../postman/gorest.postman_collection.json)
espelha os cenários acima dos quatro recursos, organizados em oito pastas
(leitura/escrita × Users/Posts/Comments/Todos):

- Pastas `* - Leitura (sem autenticação)`: não exigem token. São as pastas
  executadas no CI (`npm run postman:run:read-only`).
- Pastas `* - Escrita (autenticado)`: encadeiam variáveis de coleção entre
  requisições (ex.: usa o registro criado para depois atualizar e remover).
  Executadas localmente com `npm run postman:run` quando `GOREST_TOKEN` está
  disponível.

Executada e validada localmente: 45 requisições, 78 asserções, 0 falhas
(suíte completa); 20 requisições, 32 asserções, 0 falhas (somente leitura).

## Próximos passos

- Testes orientados a schema (geração automática de casos a partir da spec
  OpenAPI), para complementar os casos escritos manualmente.
- Relatório de testes em HTML publicado como artefato do CI.
