# Full-Stack Advanced Audit Report

## Sumário Executivo
- **Visão Geral:** Backend FastAPI orientado a agentes com Celery/Redis e frontend React/Vite focado em geração de planos nutricionais via Gemini. Infra baseada em docker-compose (Postgres + Redis + workers) com autenticação ainda placeholder.
- **Score de Maturidade (1-10):** 4.2
- **Top 5 Pontos Fortes:**
  1. Estrutura backend modular (routers/serviços/modelos) com factory do FastAPI e logging estruturado via structlog.
  2. Orquestração inicial de agentes (LangGraph + registry) permitindo extensão futura.
  3. Circuit breaker simples e retentativas no serviço Gemini.
  4. WebSocket com Redis Streams para eventos em tempo real de agentes.
  5. Frontend moderno (React 19, Vite, Zustand/React Query) com flows de onboarding e fallback de polling.
- **Top 5 Riscos Críticos:**
  1. Autenticação/autorização inexistente (requests anônimos permitidos) e sem proteção a dados sensíveis.
  2. Dependência direta do Gemini sem testes de integração, com prompts livres e sem validação robusta de saída.
  3. Modelagem de dados sem constraints/índices; ORM sem migrações configuradas, risco de inconsciência transacional.
  4. Observabilidade e segurança de produção ausentes (CORS amplo, falta de rate limiting, ausência de audit/log PII scrub).
  5. Cobertura de testes baixa e sem pipeline CI/CD; frontend sem testes E2E/performance.
- **Recomendações Prioritárias:** endurecer autenticação (JWT + RBAC), adicionar validação/checagem de JSON de IA, normalizar modelo de dados e migrations, configurar CI com testes/lint, e reforçar DevSecOps (secrets, headers, rate limiting, logs estruturados com scrubbing).

## Análise Detalhada por Dimensão
### 1. Arquitetura e Design
- **Status Atual:** Monólito FastAPI com camadas claras (routers/serviços/esquemas) e frontend SPA. Orquestração de agentes via LangGraph, Celery para assíncrono e Redis Streams para eventos.
- **Gaps Identificados:** Acoplamento entre camada de orquestração e serviço Gemini (chamadas diretas); imports mortos em rotas; ausência de interfaces para substituir provedor LLM; sem documentação arquitetural.
- **Benchmarking:** Falta de padrões de Clean/Hexagonal; dependências externas não isoladas via portas/adapters; frontend não segue design system consistente documentado.
- **Impacto:** Alto (dificulta extensão e testes).
- **Recomendações:** Introduzir camada de porta/adapter para LLM e message bus; remover acoplamentos e imports não usados; criar ADRs e diagramas; modularizar frontend em features slices.

### 2. Código e Implementação
- **Status Atual:** Código legível com Pydantic v2, mas agentes/serviços possuem tratamento de erro limitado e alguns arquivos carecem de imports/typing.
- **Gaps Identificados:**
  - Autenticação placeholder que aceita requisições sem credenciais.【F:backend/app/core/security.py†L1-L13】
  - Rotas de tarefas trazem múltiplos imports não utilizados e não validam a existência de tarefas Celery além do status básico.【F:backend/app/api/routes/tasks.py†L1-L44】
  - Serviço Gemini assume JSON bem formado e executa prompts livres sem validação semântica além do parse; circuit breaker global em memória pode vazar entre requisições e não é thread-safe.【F:backend/app/services/gemini.py†L1-L109】
  - Registry de agentes não tipado (Dict/Optional não importados), risco de NameError em runtime.【F:backend/app/agents/registry.py†L1-L15】
- **Benchmarking:** Ausência de type-check (mypy) na pipeline; duplicação de lógica de validação de perfil/planos; frontend com handlers grandes em `App.tsx` sem divisão em hooks.
- **Impacto:** Médio-Alto (bugs silenciosos e instabilidade em produção).
- **Recomendações:** Ativar lint/type-check no CI; refatorar handlers para hooks; adicionar validação de payloads de IA e contratos tipados; sanear imports e ajustes de typing.

### 3. Performance e Otimização
- **Status Atual:** Backend assíncrono, mas chamadas ao Gemini são síncronas e podem bloquear worker Celery; DB sem índices; frontend sem code-splitting configurado explicitamente.
- **Gaps Identificados:** Sem caching de respostas do Gemini, risco de latência alta; WebSocket broadcast sem backpressure; ausência de pagination em listagens (logs/planos/relatórios).【F:backend/app/services/profile_service.py†L1-L66】
- **Benchmarking:** Não há métricas de FCP/LCP ou análise de bundle; docker-compose não usa worker pool escalável.
- **Impacto:** Médio (latência e consumo de recursos).
- **Recomendações:** Tornar chamadas Gemini assíncronas com timeouts; adicionar índices em FK e datas; habilitar code-splitting/lazy loading; implementar paginação e cache com TTL.

### 4. Segurança e Compliance
- **Status Atual:** CORS permissivo, autenticação opcional via header; nenhuma criptografia de dados em repouso ou policies de segredo.
- **Gaps Identificados:** Falta de RBAC/MFA; tokens não renováveis; exposição potencial de PII em logs/eventos; sem CSP/segurança de headers no frontend; sem validação de entrada para logs/meals contra XSS.
- **Benchmarking:** Não aderente a OWASP Top 10 (Broken Auth/Access Control, Sensitive Data Exposure); secrets em .env sem vault.
- **Impacto:** Crítico.
- **Recomendações:** Implementar JWT com expiração/refresh, RBAC por rota; exigir HTTPS e Secure cookies; sanitizar logs; aplicar helmet/CSP no frontend e validar inputs; adicionar rate limiting no FastAPI.

### 5. Experiência do Usuário
- **Status Atual:** UI moderna com loaders e onboarding; gestos de swipe e toasts implementados em `App.tsx`.
- **Gaps Identificados:** Falta de acessibilidade (aria-labels, navegação por teclado não evidente); mensagens de erro genéricas; ausência de skeletons/prefetch; sem internacionalização completa apesar de context de idioma.
- **Benchmarking:** Não atende WCAG 2.1 AA; não há design system definido.
- **Impacto:** Médio.
- **Recomendações:** Adicionar testes de acessibilidade, aria attrs; implementar loading states consistentes; criar design tokens e documentação de UX.

### 6. Testes e Qualidade
- **Status Atual:** Alguns testes unitários backend para Gemini/orquestrador/rotas; frontend sem testes implementados no repo apesar de tooling.
- **Gaps Identificados:** Cobertura desconhecida; testes de integração/E2E ausentes; Celery/Redis/DB não simulados nos testes críticos; ausência de CI.
- **Benchmarking:** Pirâmide de testes incompleta; sem mutation/performance tests.
- **Impacto:** Alto.
- **Recomendações:** Adicionar cobertura automática; criar testes de integração com DB temporário; E2E com Playwright para fluxo de geração de plano; configurar GitHub Actions.

### 7. Banco de Dados e Persistência
- **Status Atual:** Modelos ORM definidos sem migrações ativas; JSONB usado para perfis/planos/relatórios; relações simples.
- **Gaps Identificados:** Sem índices em FKs/datas; sem constraints únicas ou validação de domínio; ausência de migrations (alembic não configurado no repo).【F:backend/app/models/profile.py†L1-L43】
- **Benchmarking:** Não segue 12-Factor para persistência (migrações versionadas); falta de politicas de retenção/archiving.
- **Impacto:** Alto (risco de corrupção e lentidão em escala).
- **Recomendações:** Criar migrações Alembic; definir índices e constraints (unique profile id, indexes on timestamps); considerar normalização parcial (separar dados sensíveis); adicionar backups/DR runbook.

### 8. Observabilidade e Monitoramento
- **Status Atual:** Logging estruturado com structlog; eventos de agentes emitidos para Redis Streams.
- **Gaps Identificados:** Sem métricas (Prometheus/OpenTelemetry); sem tracing distribuído; logs não redigidos de PII; ausência de alertas ou dashboards.
- **Benchmarking:** Não atende SRE práticas (SLI/SLO/SLA); sem error tracking (Sentry).
- **Impacto:** Médio-Alto.
- **Recomendações:** Integrar OTEL para FastAPI/Celery; expor métricas; configurar alertas de filas/latência; centralizar logs com retenção segura.

### 9. Infraestrutura e DevOps
- **Status Atual:** docker-compose para dev com Postgres/Redis; scripts de logs; não há IaC ou Kubernetes manifestos.
- **Gaps Identificados:** Sem auto-scaling ou health checks; secrets não geridos; ausência de pipelines de deploy/rollback; contêineres possivelmente executam como root.
- **Benchmarking:** Não compatível com 12-Factor (build/release/run separados); falta de CD e estratégias blue/green.
- **Impacto:** Alto.
- **Recomendações:** Adotar IaC (Terraform) e Helm; configurar health/readiness probes; usar non-root images; implementar CI/CD com ambientes de staging e estratégias de deploy seguro.

### 10. Documentação e Maturidade
- **Status Atual:** README com quickstart; ausência de docs detalhados, ADRs ou diagramas.
- **Gaps Identificados:** Sem documentação de API (OpenAPI não descrita); sem runbooks; falta de governance (branching/versionamento); dependências não auditadas.
- **Benchmarking:** Abaixo de padrões de produção.
- **Impacto:** Médio.
- **Recomendações:** Gerar docs automáticos do FastAPI/Swagger; adicionar contribution guide, ADRs e diagramas; definir convenções de branching e versionamento semântico; ativar scanners de dependência.

## Roadmap de Melhorias
- **Quick Wins (<1 semana):** Endurecer autenticação JWT + RBAC; remover imports mortos; adicionar validação de payload Gemini e saneamento de logs; configurar lint/type-check em CI; criar migrações iniciais.
- **Curto Prazo (1-4 semanas):** Implementar testes de integração/E2E; adicionar índices e paginação; introduzir caching e timeouts para Gemini; aplicar headers de segurança e rate limiting; criar design tokens e checklist de acessibilidade.
- **Médio Prazo (1-3 meses):** Refatorar para arquitetura hexagonal (ports/adapters para LLM e storage); instrumentar OTEL + métricas; estabelecer CI/CD completo com deploy canário; evoluir modelo de dados e retenção.
- **Longo Prazo (3+ meses):** Avaliar migração para microsserviços/serviços de domínio (orquestração, perfil, relatórios); adotar service mesh e auto-scaling; implementar governança de dados (GDPR/LGPD) com anonimização e DLP.

## Matriz de Priorização
- **FAZER AGORA (Alto Impacto/Baixo Esforço):** Autenticação/RBAC, validação de JSON de IA, migrações + índices básicos, CI com lint/test, headers de segurança.
- **PLANEJAR (Alto Impacto/Alto Esforço):** Arquitetura hexagonal, observabilidade completa, CI/CD com deploy seguro, refino de modelo de dados e DR.
- **CONSIDERAR (Baixo Impacto/Baixo Esforço):** Limpeza de imports, hooks de frontend para handlers, scripts de seed/demo.
- **EVITAR (Baixo Impacto/Alto Esforço):** Otimizações prematuras em microservices sem resolver autenticação/observabilidade básica.

## Benchmarking Comparativo
- Comparado a referências FastAPI + Celery (e.g., Tiangolo/full-stack FastAPI), o projeto carece de autenticação sólida, migrations automatizadas e CI/CD.
- Frente às práticas 12-Factor, ainda faltam gestão de configs por ambiente, logs centralizados e processos stateless.
- Em relação a apps React de saúde (p.ex. open-source Medplum UI), faltam testes acessibilidade e design system consistente.
