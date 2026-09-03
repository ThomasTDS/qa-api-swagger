# Plano de testes - Recurso Users (GoRest)

API sob teste: `https://gorest.co.in/public/v2` (GoRest, API pública de terceiros).
Contrato de referência: [`openapi/gorest-openapi.yaml`](../openapi/gorest-openapi.yaml).

Este documento lista os casos de teste implementados nesta primeira etapa do
projeto. Novos casos serão adicionados incrementalmente conforme o projeto
evolui (ver seção "Próximos passos").

## Casos implementados

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

## Próximos passos

- Adicionar cenários autenticados (POST, PUT, DELETE) usando um token pessoal
  do GoRest, configurado como secret no repositório.
- Cobrir cenários de validação de campos obrigatórios e formatos (ex.: email
  inválido, campos ausentes) nas operações de escrita.
- Ampliar a especificação OpenAPI e os testes para outros recursos da GoRest
  (posts, comments, todos).
- Adicionar uma coleção Postman/Newman gerada a partir da especificação
  OpenAPI, como forma alternativa de execução dos testes de contrato.
