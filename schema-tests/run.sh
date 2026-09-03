#!/usr/bin/env bash
# Roda o Schemathesis contra a API real da GoRest, gerando casos de teste
# automaticamente a partir da especificacao OpenAPI (property-based testing).
#
# Restrito a operacoes GET (idempotentes / somente leitura) de propósito:
# a GoRest e um sandbox publico compartilhado, e o Schemathesis gera muitas
# combinacoes de entrada por operacao - rodar isso contra POST/PUT/DELETE
# poluiria o sandbox e arriscaria estourar o rate limit do token. A
# cobertura de escrita ja fica coberta pelos testes Jest e pela colecao
# Postman, escritos manualmente com limpeza dos dados criados.
set -euo pipefail

cd "$(dirname "$0")/.."

schemathesis run openapi/gorest-openapi.yaml \
  --url https://gorest.co.in/public/v2 \
  --include-method GET \
  --max-examples "${SCHEMATHESIS_MAX_EXAMPLES:-3}" \
  --rate-limit 20/m \
  --no-color
