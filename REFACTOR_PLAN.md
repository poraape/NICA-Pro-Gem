# Plano de Refatoração Full-Stack

Este plano operacionaliza a auditoria registrada em `AUDIT_REPORT.md`, priorizando alto ROI, passos incrementais e validação contínua. Todas as ações pressupõem preservação de comportamento, commits pequenos e testes após cada mudança.

## Fase 0 — Preparação e Baseline
- **Branch dedicado:** criar branches `refactor/<escopo>` para cada tema.
- **Saúde atual:** garantir testes existentes passando (backend `poetry run pytest`, frontend `npm test` quando disponível).
- **Métricas de baseline:**
  - Cobertura de testes backend/frontend (ex.: `pytest --cov`, `vitest --coverage`).
  - Tempo de build/teste CI local (`npm run build`, `poetry run pytest`).
  - Tamanho do bundle (`frontend`: `npm run build -- --analyze`).
  - Latência crítica (`/api/agents/plan`, `/health`) via `k6` smoke (p95).
- **Ferramentas:** ativar linters (`ruff`/`black` no backend, `eslint`/`prettier` no frontend) e SCA (`pip-audit`, `npm audit --production`).
- **Backup e staging:** garantir `.env` seguro e ambientes isolados para migrações.

## Fase 1 — Quick Wins (baixo risco)
- **Higiene de código:**
  - Padronizar formatação (backend: `ruff format`/`black`; frontend: `prettier`).
  - Remover imports não usados e comentários mortos; nomes explícitos para booleans (ex.: `is_active`).
  - Extrair números mágicos para constantes/configurações (.env, `settings.py`, `config.ts`).
- **Validação e segurança imediata:**
  - Backend: adicionar validação Pydantic nas rotas de agentes e respostas do Gemini; aplicar CORS restrito, rate limiting básico e headers de segurança no FastAPI middleware.
  - Frontend: sanitizar renderização de textos retornados pela IA, usar schemas (Zod) para formular inputs.
- **Observabilidade mínima:**
  - Estruturar logs com correlation id (`request_id`) e scrub de PII; configurar níveis INFO/WARN/ERROR.
  - Health checks completos incluindo dependências (Redis, Postgres quando habilitado).
- **Documentação rápida:** atualizar README com comandos de lint/test e variáveis críticas (GEMINI_API_KEY, Redis, Postgres).

## Fase 2 — Estruturais (curto prazo)
- **Modularização backend:**
  - Separar camadas (routers → services/use-cases → repositories → clients). Extrair integração Gemini para `app/clients/gemini.py` com interface mockável.
  - Introduzir migrações (alembic) e normalizar modelos com constraints e índices básicos; adicionar fixtures de desenvolvimento.
  - Implementar contratos de DTOs/response envelopes consistentes (status/meta/data).
- **Frontend:**
  - Introduzir feature folders por domínio (ex.: `agents/`, `plans/`), isolando hooks (React Query), componentes e schemas.
  - Aplicar code-splitting em rotas pesadas e lazy load para gráficos; memoizar componentes sensíveis a re-render.
- **APIs e contratos:**
  - Versionar rotas (`/api/v1/...`), padronizar HTTP verbs e paginação; documentação OpenAPI/Swagger.
  - Adicionar testes de caracterização para fluxos críticos (`/api/agents/plan` happy/edge paths) antes de refatorar.

## Fase 3 — Arquiteturais (médio prazo)
- **Segregação de domínio:**
  - Adotar arquitetura em camadas/hexagonal: domain (entidades/valores) sem dependência de infraestrutura; adapters para Redis/Gemini.
  - Introduzir interfaces para integrações externas e injeção de dependência para testabilidade.
- **Decomposição progressiva:**
  - Isolar serviço de orquestração de agentes como boundary context; preparar estrangulamento caso microserviço futuro (API gateway → serviço de planos).
- **CQRS light:** separar comandos (criação/execução de planos) de queries (consultas de estado/eventos), com caches/replicas de leitura quando Postgres ativo.

## Fase 4 — Segurança e Compliance (contínuo)
- **Autenticação/Autorização:** implementar JWT com refresh + RBAC (roles admin/agent/user); middleware de autorização por rota.
- **Proteção de dados:** hashing de segredos, secrets no Vault/Env, TLS end-to-end, mascaramento de PII em logs.
- **Defesas OWASP:** validação/sanitização full-stack, CSRF nos fluxos web, headers CSP/HSTS, rate limiting por IP/usuário, prepared statements em todas as queries.
- **Dependências:** varredura contínua (`pip-audit`, `npm audit`, Dependabot). Corrigir CVEs críticas/altas em 72h.

## Fase 5 — Performance
- **Backend:**
  - Eliminar N+1 nas consultas; usar `select_related`/`prefetch_related` ou equivalentes no ORM; índices em foreign keys e campos de busca.
  - Cache de leitura para planos e eventos recentes (Redis) com invalidação clara; pool de conexões tunado.
  - Jobs pesados em background (Celery/Dramatiq) com circuit breakers e retries com backoff.
- **Frontend:**
  - Medir e otimizar LCP/FID/CLS (Lighthouse). Habilitar `react-query` cache e stale times para evitar requisições redundantes.
  - Otimizar bundle (tree shaking, dynamic imports), lazy-load de imagens/ativos, uso de formatos modernos (WebP/AVIF).

## Fase 6 — Testes e Qualidade
- **Pirâmide de testes:** meta ≥80% linha backend e cobertura de lógica crítica 100%; frontend com unit + component + E2E (Playwright/Cypress).
- **Suites:**
  - Unit: services, validações, adaptadores Gemini/Redis mockados.
  - Integração: rotas REST, WebSocket de eventos, pipelines Celery com Redis/Postgres locais.
  - E2E: fluxos de geração/visualização de planos no frontend contra backend em dev/staging.
  - Performance: k6 para principais endpoints (p95 < 500ms) e Lighthouse (score ≥90).
- **CI/CD:** pipeline com lint + tests + coverage gate; uploads de relatórios; bloqueio em falhas.

## Fase 7 — Documentação e Conhecimento
- Atualizar `README` e criar `ARCHITECTURE.md` (C4), `API.md` (OpenAPI), `CONTRIBUTING.md` (lint/test/PR checklist) e ADRs para decisões chave (mensageria, auth, caching).
- Manter changelog e runbooks de incidentes/rollback.

## Fase 8 — Observabilidade
- **Logging estruturado:** JSON com `request_id`, `user_id`, `correlation_id`; sanitização de PII.
- **Métricas:** HTTP request duration, taxa de erro, filas Celery, cache hit rate, uso de recursos. Exportar para Prometheus e dashboards (Grafana).
- **Tracing distribuído:** OpenTelemetry spans para rotas, chamadas Gemini e Redis; correlação com logs.
- **Alertas:** thresholds para p95 >1s, error rate >1%, CPU>80%, memory>90%, falhas de healthcheck.

## Roadmap Prioritário (alto impacto/baixo esforço primeiro)
1. Configurar linters/formatters + testes smoke (Fase 0/1).
2. Adicionar validação robusta e headers de segurança no backend; sanitização no frontend (Fase 1/4).
3. Introduzir OpenAPI + versionamento de rotas e testes de caracterização (Fase 2).
4. Estruturar camadas e interfaces para Gemini/Redis; migrar para alembic e índices básicos (Fase 2/3).
5. Implantar CI/CD com lint/test/coverage e dependabot (Fase 6).
6. Configurar observabilidade mínima (logs estruturados + métricas HTTP) e caching de leituras frequentes (Fase 5/8).
7. Evoluir para RBAC/JWT, CQRS light e otimizações de performance LCP/p95 (Fase 3/4/5).

## Critérios de Aceitação
- Testes e lint verdes em CI; cobertura ≥80% linhas (lógica crítica 100%).
- 0 vulnerabilidades críticas/altas abertas; secrets externalizados.
- P95 < 500ms em endpoints críticos; Lighthouse ≥90; bundle reduzido ≥20% vs baseline.
- Documentação atualizada (README + arquitetura + API + ADRs); migrações versionadas e reversíveis.
- Observabilidade ativa: logs estruturados, métricas e alertas configurados; healthchecks prontos para deploy.
