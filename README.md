# Fatec Study Platform

Plataforma de estudos questão por questão para provas da Fatec, com Angular, NestJS, Prisma, Postgres, Gemini e Docker.

## Stack

- Frontend: Angular standalone + Tailwind + SCSS com direção visual Soft Pastel.
- Backend: NestJS REST API.
- Banco: Postgres via Prisma.
- IA: Gemini API no backend, com fallback local quando `GEMINI_API_KEY` não estiver configurada.
- Deploy: Docker Compose com `web`, `api` e `postgres`.

## Rodando Localmente

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run seed -w @fatec-study/api
npm run dev:api
npm run dev:web
```

Frontend: `http://localhost:4200`  
API: `http://localhost:3000/api`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Aplicacao: `http://localhost:8080`

Seed de exemplo no container:

```bash
docker compose exec api npm run seed:prod -w @fatec-study/api
```

Importacao local com PDFs em `./provas`:

```bash
docker compose exec api npm run import:fatec:prod -w @fatec-study/api
```

Quando a pasta `provas` existir, a API prioriza esses PDFs locais em vez de tentar buscar no site da Fatec.

## Importando Provas da Fatec

Com a API rodando:

```bash
curl -X POST http://localhost:3000/api/admin/import/fatec \
  -H "x-admin-token: change-me"
```

Ou pelo container da API:

```bash
docker compose exec api npm run import:fatec:prod -w @fatec-study/api
```

O importador descobre os detalhes pela pagina oficial, baixa PDFs de prova/gabarito, extrai texto, cruza gabarito por numero da questao e salva tudo de forma idempotente.

## Como a IA Funciona

O backend chama Gemini apenas quando uma explicacao ainda nao existe para a questao. A resposta esperada e JSON estruturado com:

- resposta correta;
- passos da resolucao;
- explicacao de erro provavel por alternativa.

Depois de gerada, a explicacao fica salva no Postgres e e reutilizada nas proximas tentativas, reduzindo custo e latencia.
