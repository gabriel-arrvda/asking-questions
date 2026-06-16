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

## Deploy na VPS com GitHub Actions

O workflow `.github/workflows/deploy-vps.yml` roda lint, testes e build. Se tudo passar, ele acessa a VPS via SSH, atualiza a branch `main`, recria os containers, roda migrations Prisma e, opcionalmente, importa as provas.

Secrets necessarios no GitHub em `Settings > Secrets and variables > Actions`:

- `VPS_HOST`: IP ou dominio da VPS.
- `VPS_USER`: usuario SSH.
- `VPS_SSH_KEY_B64`: chave privada SSH em base64, sem passphrase. Preferencial.
- `VPS_APP_DIR`: caminho do projeto na VPS, por exemplo `/var/www/fatec-study`.
- `POSTGRES_PASSWORD`: senha do Postgres em producao.
- `GEMINI_API_KEY`: chave da API Gemini.
- `CORS_ORIGIN`: origem publica do frontend, por exemplo `https://seudominio.com`.

Secrets opcionais:

- `VPS_PORT`: porta SSH, padrao `22`.
- `POSTGRES_USER`: padrao `fatec`.
- `POSTGRES_DB`: padrao `fatec_study`.
- `DATABASE_URL`: URL completa do Prisma. Use se a senha tiver caracteres especiais e voce preferir informar a URL ja escapada.
- `VPS_SSH_KEY`: chave privada SSH em texto. Use apenas se nao quiser usar `VPS_SSH_KEY_B64`.

Preparacao inicial na VPS:

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
git clone <url-do-repositorio> /var/www/fatec-study
mkdir -p /var/www/fatec-study/provas
```

Gerando uma chave SSH para o deploy:

```bash
ssh-keygen -t ed25519 -C "github-actions-fatec-study" -f ~/.ssh/fatec_study_deploy -N ""
ssh-copy-id -i ~/.ssh/fatec_study_deploy.pub usuario@IP_DA_VPS
base64 -i ~/.ssh/fatec_study_deploy | pbcopy
```

Cole o valor copiado no secret `VPS_SSH_KEY_B64`. Em Linux, troque o ultimo comando por:

```bash
base64 -w 0 ~/.ssh/fatec_study_deploy
```

Depois disso, pushes na `main` fazem deploy automatico. Para reimportar as provas, rode o workflow manualmente em `Actions > Deploy VPS > Run workflow` marcando `run_import`.

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
