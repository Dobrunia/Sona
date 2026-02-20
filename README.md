# Sona

Web-сервис для загрузки, прослушивания и поиска пользовательской музыки с лайками, избранным и онлайн-статусом. SPA с постоянным аудиоплеером и Web 1.0 aesthetic.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vue 3, Pinia, Vuetify 3, Apollo Client, Vite |
| Backend | Node.js, Express, Apollo Server (GraphQL), Prisma, MySQL |
| Storage | Yandex Object Storage (S3-compatible), presigned URLs |
| Realtime | WebSocket (online-status, current track) |
| Auth | Google OAuth → JWT access + refresh tokens |

## Prerequisites

- Node.js 18+
- pnpm
- Docker + Docker Compose

## Quick Start

### 1. MySQL

```bash
docker compose up -d
```

### 2. Server

```bash
cd server
cp .env.example .env
```

Fill `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string (default works with docker-compose) |
| `JWT_SECRET` | Any random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `S3_ENDPOINT` | `https://storage.yandexcloud.net` |
| `S3_REGION` | `ru-central1` |
| `S3_BUCKET` | Your Yandex Object Storage bucket |
| `S3_ACCESS_KEY_ID` | S3 access key |
| `S3_SECRET_ACCESS_KEY` | S3 secret key |

```bash
pnpm install
pnpm run prisma:generate
pnpm run prisma:push
pnpm run dev
```

Server starts at `http://localhost:4000`.

| Endpoint | URL |
|---|---|
| GraphQL | `http://localhost:4000/graphql` |
| Health | `http://localhost:4000/health` |
| WebSocket | `ws://localhost:4000/ws` |

### 3. Client

```bash
cd client
cp .env.example .env
```

Set `VITE_GOOGLE_CLIENT_ID` in `.env`.

```bash
pnpm install
pnpm run dev
```

Client starts at `http://localhost:5173`.

### 4. S3 CORS (one-time)

CORS must be configured on the bucket for browser uploads/streaming. Run once from `server/`:

```bash
pnpm run s3:cors
```

## Limits

| What | Limit |
|---|---|
| Audio | MP3 only, max 20 MB, max 10 min |
| Cover | jpg/png/webp, max 10 MB |

## Scripts

### Server (`server/`)

| Script | Description |
|---|---|
| `pnpm dev` | Dev server with hot reload (tsx watch) |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled build |
| `pnpm prisma:push` | Sync Prisma schema to DB |
| `pnpm prisma:studio` | Open Prisma Studio GUI |
| `pnpm codegen` | Generate GraphQL resolver types |
| `pnpm s3:cors` | Configure CORS on S3 bucket (one-time) |

### Client (`client/`)

| Script | Description |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm codegen` | Generate GraphQL operation types |
