# Política de segurança

## Escopo

Esta política cobre o código e a configuração deste repositório: os testes,
scripts, workflows de CI/CD e suas dependências.

**Não cobre a GoRest** (a API sob teste) - é um serviço público de
terceiros. Comportamentos inesperados encontrados nela são documentados como
[issues normais](.github/ISSUE_TEMPLATE/defeito-api.yml), não como reporte
de segurança, já que não há nada a corrigir por aqui.

## Reportando uma vulnerabilidade

Se encontrar uma vulnerabilidade real no código ou na configuração deste
repositório (não uma dependência já conhecida - ver abaixo), reporte pelo
recurso de [Private vulnerability reporting](https://github.com/ThomasTDS/qa-api-swagger/security/advisories/new)
do GitHub, em vez de abrir uma issue pública. Isso cria um relatório privado
visível só para mim até que o problema seja tratado.

Este é um projeto de portfólio mantido por uma pessoa só, sem SLA formal,
mas relatórios são tratados com prioridade assim que chegam.

## Dependências conhecidas

Algumas devDependencies (`newman` e seus reporters, principalmente) trazem
vulnerabilidades conhecidas em pacotes transitivos - detalhado na nota de
segurança do [`README`](README.md#postman--newman). São aceitas
conscientemente porque essas dependências rodam só localmente/no CI, nunca
em produção. O [Dependabot](.github/dependabot.yml) monitora essas e as
demais dependências semanalmente e abre PR assim que uma versão corrigida
existir.
