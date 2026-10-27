# qa-api-swagger

*[Leia em português](README.md)*

[![CI](https://github.com/ThomasTDS/qa-api-swagger/actions/workflows/ci.yml/badge.svg)](https://github.com/ThomasTDS/qa-api-swagger/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ThomasTDS/qa-api-swagger/branch/main/graph/badge.svg)](https://codecov.io/gh/ThomasTDS/qa-api-swagger)
[![Swagger UI](https://img.shields.io/badge/docs-swagger--ui-85EA2D?logo=swagger&logoColor=white)](https://thomastds.github.io/qa-api-swagger/)
[![License: MIT](https://img.shields.io/github/license/ThomasTDS/qa-api-swagger)](LICENSE)

An automated API testing project focused on contract documentation via
**OpenAPI/Swagger**. The API under test is [GoRest](https://gorest.co.in/),
a public testing service with a full REST resource of users, posts,
comments and todos.

This repository is built incrementally: it starts with a small set of tests
and grows over time, covering more endpoints, scenarios and tools.

## Goal

Demonstrate, in practice:

- Writing an **OpenAPI 3.0** specification from observing an API's real
  behavior (GoRest doesn't publish an official spec).
- Automated API tests with **Jest**, covering **positive and negative**
  scenarios.
- Contract validation (**contract testing**): API responses are checked
  against the OpenAPI specification at runtime, via `jest-openapi`.
- **CI/CD** with GitHub Actions, validating the spec, linting and running
  the tests on every push and pull request.
- Test case documentation ([`docs/test-plan.md`](docs/test-plan.md)) and
  defects observed in the API under test (repository issues).
- A **Postman** collection, generated from the same OpenAPI specification
  and run via **Newman**, as an alternative way to run the contract tests.
- A **Swagger UI** instance published via GitHub Pages, rendering the
  specification directly from the repository.
- Schema-based testing with **Schemathesis** (*property-based testing*),
  generating test cases automatically from the OpenAPI spec - it has
  already found and documented real defects in the API under test.
- **HTML** test reports, generated on every Jest and Newman run and
  published as a CI artifact.
- Security tests inspired by the **OWASP API Security Top 10** (invalid
  authentication, mass assignment, input handling, rate-limiting
  observation), scoped so it never touches third-party data nor runs an
  aggressive scan against the public sandbox.

## Structure

```
openapi/       OpenAPI specification for the tested resources
src/           HTTP client used by the Jest tests
tests/         test cases (Jest)
postman/       Postman/Newman collection and environment
scripts/       script that runs the collection via Newman
swagger-ui/    static Swagger UI page, published via GitHub Pages
schema-tests/  schema-based tests (Schemathesis)
docs/          test plan and documentation
.github/       CI, Pages deploy and schema-test workflows
```

## Running locally

Prerequisites: Node.js 20+.

```bash
npm install
npm run validate:openapi   # validates the OpenAPI specification
npm run lint                # lints the code
npm test                    # runs the tests
```

Read tests (`GET`) don't require an authentication token. Write tests
(`POST`/`PUT`/`DELETE`) require a personal GoRest token: copy
`.env.example` to `.env` and fill in `GOREST_TOKEN` with a
[personal GoRest token](https://gorest.co.in/my-account/access-tokens).
Without the token, those tests are skipped automatically, both locally
and in CI.

`npm install` already sets up a pre-commit hook (via [husky](https://typicode.github.io/husky/)
+ [lint-staged](https://github.com/lint-staged/lint-staged)) that runs
`eslint --fix` on staged `.js` files before every local commit - errors
that `--fix` can't resolve automatically block the commit.

### Postman / Newman

The collection in [`postman/gorest.postman_collection.json`](postman/gorest.postman_collection.json)
covers the same scenarios as the Jest tests (read and write, positive and
negative), with assertions via Postman test scripts.

```bash
npm run postman:run             # runs everything; without GOREST_TOKEN, skips the write folders
npm run postman:run:read-only   # runs only the read folders, even with a token configured
```

> **Security note:** `newman` and its reporters (including
> `newman-reporter-htmlextra`) bring in transitive dependencies (e.g.
> `handlebars`, via `postman-runtime`) with known vulnerabilities reported
> by `npm audit`. These are the latest available versions of those
> packages; the risk is accepted here because they only run locally/in CI,
> as a devDependency, against a public test API - never in production.
> [Dependabot](.github/dependabot.yml) is configured to open a PR as soon
> as a fixed version exists.

## Swagger UI

The specification in `openapi/gorest-openapi.yaml` is rendered live at
https://thomastds.github.io/qa-api-swagger/, via [Swagger UI](https://swagger.io/tools/swagger-ui/).
The page (`swagger-ui/index.html`) loads Swagger UI from a CDN and points
directly at the spec file on the repository's `main` branch - any merge
that changes the spec updates the published documentation automatically,
via the [`pages.yml`](.github/workflows/pages.yml) workflow.

## Schema-based testing (Schemathesis)

Besides the manually written tests, [`schema-tests/`](schema-tests/) uses
[Schemathesis](https://schemathesis.readthedocs.io/) to generate test cases
automatically from `openapi/gorest-openapi.yaml`, via *property-based
testing* - useful for finding input combinations that weren't thought of
manually.

```bash
pip install -r schema-tests/requirements.txt
bash schema-tests/run.sh
```

Deliberately restricted to `GET` operations, with few examples per
operation and a conservative rate limit, so it doesn't generate write load
or hit rate limits on GoRest's public sandbox. It runs weekly and on
demand via [`schema-tests.yml`](.github/workflows/schema-tests.yml) - not
on every push/PR, because it tends to find permanent behaviors of the
third-party API (not regressions in this repository), and a check that
always fails for a reason outside our control isn't useful.

It has already found and confirmed real defects: it reinforced [issue #3](https://github.com/ThomasTDS/qa-api-swagger/issues/3)
(filters with an out-of-enum value silently accepted) and discovered
[issue #9](https://github.com/ThomasTDS/qa-api-swagger/issues/9) (405
responses missing the `Allow` header required by RFC 9110).

## Test reports (HTML)

Both `npm test` and `npm run postman:run`/`postman:run:read-only` generate
HTML reports locally, under `reports/` (a git-ignored folder):

- `reports/jest/index.html` - via [jest-html-reporters](https://github.com/Hazyzh/jest-html-reporters).
- `reports/newman/index.html` - via [newman-reporter-htmlextra](https://github.com/DannyDainton/newman-reporter-htmlextra).

The `Authorization` header is explicitly omitted from the Newman report
(`skipHeaders` in [`scripts/run-newman.js`](scripts/run-newman.js)), so the
real token never appears in the generated HTML, even when running the
full authenticated suite locally.

In CI, these reports are published as an artifact (`test-reports`) on every
run - including when tests fail, which helps debug a failure directly from
GitHub Actions without having to reproduce it locally.

## Test coverage

`npm test` generates coverage automatically (via `--coverage`, configured
in `jest.config.js`), published to [Codecov](https://codecov.io/gh/ThomasTDS/qa-api-swagger)
on every CI run.

Worth clarifying: since this is an API-testing project, almost all the
tested logic lives in the API under test (GoRest), not in this
repository's code. `collectCoverageFrom` only measures
[`src/apiClient.js`](src/apiClient.js) - the only piece of our own code -
so the percentage reflects how exercised that HTTP client is, not how well
GoRest itself is tested (that's measured by the number and variety of
cases in `docs/test-plan.md`, not by line coverage).

## CI/CD

Every push and pull request to `main` triggers a workflow that:

1. Validates the OpenAPI specification (`swagger-cli validate`).
2. Runs the linter (`eslint`).
3. Runs the test suite (`jest`), generating coverage.
4. Publishes coverage to Codecov.
5. Runs the Postman collection via Newman, restricted to the read folders
   (to avoid duplicating write load on GoRest's public sandbox on every
   run - write coverage is already validated by the Jest tests).
6. Publishes the generated HTML reports as a workflow artifact.

Pull requests require these checks to pass, but merging is always manual -
there's no auto-merge configured in this repository.

Details on the branching flow, commit style and how to set up the
environment are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Dependencies

[Dependabot](.github/dependabot.yml) checks three sets of dependencies
weekly and opens a PR when there's an update: `npm` packages (project
root), `pip` (`schema-tests/requirements.txt`) and the actions used in the
GitHub Actions workflows. Minor/patch `npm` updates are grouped into a
single PR to reduce noise. Vulnerability alerts and automated security
fixes are also enabled on the repository - like everything else in this
project, those PRs go through the CI checks and are merged manually, one
at a time.

To report a vulnerability (or understand what's out of scope, such as
GoRest's own behavior), see [`SECURITY.md`](SECURITY.md).

## Related project

For API tests on [restful-booker](https://restful-booker.herokuapp.com/),
see the corresponding repository on my GitHub profile.
