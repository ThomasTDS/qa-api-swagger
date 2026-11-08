# qa-api-swagger

*[Leia em português](README.md) | [Read this in English](README.en.md)*

[![CI](https://github.com/ThomasTDS/qa-api-swagger/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/qa-api-swagger/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ThomasTDS/qa-api-swagger/branch/main/graph/badge.svg)](https://codecov.io/gh/ThomasTDS/qa-api-swagger)
[![Swagger UI](https://img.shields.io/badge/docs-swagger--ui-85EA2D?logo=swagger&logoColor=white)](https://thomastds.github.io/qa-api-swagger/)
[![License: MIT](https://img.shields.io/github/license/ThomasTDS/qa-api-swagger)](LICENSE)

Proyecto de pruebas automatizadas de API, con foco en la documentación de
contrato vía **OpenAPI/Swagger**. La API bajo prueba es [GoRest](https://gorest.co.in/),
un servicio público de pruebas con un recurso REST completo de usuarios,
posts, comments y todos.

Este repositorio se construye de forma incremental: comienza con un conjunto
pequeño de pruebas y crece con el tiempo, cubriendo más endpoints, escenarios
y herramientas.

## Objetivo

Demostrar, en la práctica:

- Escritura de una especificación **OpenAPI 3.0** a partir de la observación
  del comportamiento real de una API (GoRest no publica una spec oficial).
- Pruebas de API automatizadas con **Jest**, cubriendo escenarios
  **positivos y negativos**.
- Validación de contrato (**contract testing**): las respuestas de la API se
  verifican contra la especificación OpenAPI en tiempo de ejecución, vía
  `jest-openapi`.
- **CI/CD** con GitHub Actions, validando la spec, el lint y las pruebas en
  cada push y pull request.
- Documentación de casos de prueba ([`docs/test-plan.md`](docs/test-plan.md))
  y de defectos observados en la API bajo prueba (issues del repositorio).
- Una colección de **Postman**, generada a partir de la misma especificación
  OpenAPI y ejecutada vía **Newman**, como forma alternativa de correr las
  pruebas de contrato.
- Una instancia de **Swagger UI** publicada vía GitHub Pages, que renderiza
  la especificación directamente desde el repositorio.
- Pruebas basadas en schema con **Schemathesis** (*property-based testing*),
  que generan casos de prueba automáticamente a partir de la spec OpenAPI -
  ya encontraron y documentaron defectos reales en la API bajo prueba.
- Reportes de prueba en **HTML**, generados en cada ejecución de Jest y de
  Newman y publicados como artefacto del CI.
- Pruebas de seguridad inspiradas en el **OWASP API Security Top 10**
  (autenticación inválida, mass assignment, manejo de entradas, observación
  de rate limiting), con un alcance que nunca toca datos de terceros ni hace
  escaneos agresivos contra el sandbox público.

## Estructura

```
openapi/       especificación OpenAPI de los recursos probados
src/           cliente HTTP usado por las pruebas de Jest
tests/         casos de prueba (Jest)
postman/       collection y environment de Postman/Newman
scripts/       script que ejecuta la collection vía Newman
swagger-ui/    página estática de Swagger UI, publicada vía GitHub Pages
schema-tests/  pruebas basadas en schema (Schemathesis)
docs/          plan de pruebas y documentación
.github/       workflows de CI, deploy de Pages y pruebas de schema
```

## Cómo ejecutar localmente

Requisitos previos: Node.js 20+.

```bash
npm install
npm run validate:openapi   # valida la especificación OpenAPI
npm run lint                # lint del código
npm test                    # ejecuta las pruebas
```

Las pruebas de lectura (`GET`) no requieren token de autenticación. Las
pruebas de escritura (`POST`/`PUT`/`DELETE`) requieren un token personal de
GoRest: copia `.env.example` a `.env` y completa `GOREST_TOKEN` con un
[token personal de GoRest](https://gorest.co.in/my-account/access-tokens).
Sin el token, esas pruebas se omiten automáticamente, tanto localmente como
en el CI.

`npm install` ya configura un hook de pre-commit (vía [husky](https://typicode.github.io/husky/)
+ [lint-staged](https://github.com/lint-staged/lint-staged)) que ejecuta
`eslint --fix` sobre los archivos `.js` en staging antes de cada commit
local - los errores que `--fix` no puede resolver automáticamente bloquean
el commit.

### Postman / Newman

La colección en [`postman/gorest.postman_collection.json`](postman/gorest.postman_collection.json)
cubre los mismos escenarios que las pruebas de Jest (lectura y escritura,
positivos y negativos), con aserciones vía scripts de prueba de Postman.

```bash
npm run postman:run             # ejecuta todo; sin GOREST_TOKEN, omite las carpetas de escritura
npm run postman:run:read-only   # ejecuta solo las carpetas de lectura, incluso con token configurado
```

> **Nota de seguridad:** `newman` y sus reporters (incluido
> `newman-reporter-htmlextra`) traen dependencias transitivas (p. ej.
> `handlebars`, vía `postman-runtime`) con vulnerabilidades conocidas
> reportadas por `npm audit`. Son las versiones más recientes disponibles de
> esos paquetes; el riesgo se acepta aquí porque solo se ejecutan
> localmente/en el CI, como devDependency, contra una API pública de prueba -
> nunca en producción. [Dependabot](.github/dependabot.yml) está configurado
> para abrir un PR en cuanto exista una versión corregida.

## Swagger UI

La especificación en `openapi/gorest-openapi.yaml` se renderiza en vivo en
https://thomastds.github.io/qa-api-swagger/, vía [Swagger UI](https://swagger.io/tools/swagger-ui/).
La página (`swagger-ui/index.html`) carga Swagger UI desde un CDN y apunta
directamente al archivo de la spec en la rama `main` del repositorio -
cualquier merge que modifique la spec actualiza la documentación publicada
automáticamente, vía el workflow [`pages.yml`](.github/workflows/pages.yml).

## Pruebas basadas en schema (Schemathesis)

Además de las pruebas escritas manualmente, [`schema-tests/`](schema-tests/)
usa [Schemathesis](https://schemathesis.readthedocs.io/) para generar casos
de prueba automáticamente a partir de `openapi/gorest-openapi.yaml`, vía
*property-based testing* - útil para encontrar combinaciones de entrada que
no se pensaron manualmente.

```bash
pip install -r schema-tests/requirements.txt
bash schema-tests/run.sh
```

Restringido a propósito a operaciones `GET`, con pocos ejemplos por
operación y un rate limit conservador, para no generar carga de escritura ni
superar los límites del sandbox público de GoRest. Se ejecuta semanalmente y
bajo demanda vía [`schema-tests.yml`](.github/workflows/schema-tests.yml) -
no en cada push/PR, porque tiende a encontrar comportamientos permanentes de
la API de terceros (no regresiones de este repositorio), y no tiene sentido
un check que siempre falla por un motivo fuera de nuestro control.

Ya encontró y confirmó defectos reales: reforzó la [issue #3](https://github.com/ThomasTDS/qa-api-swagger/issues/3)
(filtros con un valor fuera del enum aceptados silenciosamente) y descubrió
la [issue #9](https://github.com/ThomasTDS/qa-api-swagger/issues/9)
(respuestas 405 sin el header `Allow` exigido por la RFC 9110).

## Reportes de prueba (HTML)

Tanto `npm test` como `npm run postman:run`/`postman:run:read-only` generan
reportes en HTML localmente, en `reports/` (carpeta ignorada por git):

- `reports/jest/index.html` - vía [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters).
- `reports/newman/index.html` - vía [newman-reporter-htmlextra](https://github.com/DannyDainton/newman-reporter-htmlextra).

El header `Authorization` se omite explícitamente del reporte de Newman
(`skipHeaders` en [`scripts/run-newman.js`](scripts/run-newman.js)), para
que el token real nunca aparezca en el HTML generado, incluso al ejecutar la
suite completa autenticada localmente.

En el CI, estos reportes se publican como artefacto (`test-reports`) en cada
ejecución - incluso cuando las pruebas fallan, lo que ayuda a depurar el
motivo de un fallo directamente desde GitHub Actions, sin necesidad de
reproducirlo localmente.

## Cobertura de pruebas

`npm test` genera cobertura automáticamente (vía `--coverage`, configurado
en `jest.config.js`), publicada en [Codecov](https://codecov.io/gh/ThomasTDS/qa-api-swagger)
en cada ejecución del CI.

Vale una aclaración: como este es un proyecto de pruebas de API, casi toda
la lógica probada vive en la API bajo prueba (GoRest), no en el código de
este repositorio. `collectCoverageFrom` mide únicamente
[`src/apiClient.js`](src/apiClient.js) - el único archivo de código propio -
así que el porcentaje refleja qué tan ejercitado está ese cliente HTTP, y no
qué tan bien probada está GoRest (eso se mide por la cantidad y variedad de
casos en `docs/test-plan.md`, no por cobertura de líneas).

## CI/CD

Cada push y pull request hacia `main` dispara un workflow que:

1. Valida la especificación OpenAPI (`swagger-cli validate`).
2. Ejecuta el lint (`eslint`).
3. Ejecuta la suite de pruebas (`jest`), generando cobertura.
4. Publica la cobertura en Codecov.
5. Ejecuta la colección de Postman vía Newman, restringida a las carpetas de
   lectura (para no duplicar la carga de escritura en el sandbox público de
   GoRest en cada ejecución - la cobertura de escritura ya la validan las
   pruebas de Jest).
6. Publica los reportes HTML generados como artefacto del workflow.

Los pull requests exigen que estos checks pasen, pero el merge es siempre
manual - no hay auto-merge configurado en este repositorio.

Los detalles sobre el flujo de ramas, el estándar de commits y cómo
configurar el entorno están en [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Dependencias

[Dependabot](.github/dependabot.yml) revisa semanalmente tres conjuntos de
dependencias y abre un PR cuando hay una actualización: paquetes `npm` (raíz
del proyecto), `pip` (`schema-tests/requirements.txt`) y las actions usadas
en los workflows de GitHub Actions. Las actualizaciones menores/patch de
`npm` se agrupan en un único PR para reducir el ruido. Las alertas de
vulnerabilidad y las correcciones automáticas de seguridad también están
habilitadas en el repositorio - como en todo el resto del proyecto, esos PRs
pasan por los checks del CI y se mergean manualmente, uno por uno.

Para reportar una vulnerabilidad (o entender qué queda fuera del alcance,
como el comportamiento de GoRest en sí), consulta [`SECURITY.md`](SECURITY.md).

## Proyecto relacionado

Para pruebas de API sobre [restful-booker](https://restful-booker.herokuapp.com/),
consulta el repositorio correspondiente en mi perfil de GitHub.
