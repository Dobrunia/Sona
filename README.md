# Music Service

## Server (local)

### Requirements

- Node.js 18+
- pnpm
- Docker + Docker Compose

### Setup

1. Start MySQL in Docker:

```bash
docker compose up -d
```

2. Create env file:

```bash
cd ./server
cp .env.example .env
```

Fill in required auth and S3 settings in `/Users/dobruniakostrigin/front-end/Sona/server/.env`.

3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma client and sync schema:

```bash
pnpm run prisma:generate
pnpm run prisma:migrate
```

### Run server

```bash
pnpm run dev
```

### Endpoints

- GraphQL: `http://localhost:4000/graphql`
- Health: `http://localhost:4000/health`
- WebSocket: `ws://localhost:4000/ws`

## Client (local)

### Setup

```bash
cd /Users/dobruniakostrigin/front-end/Sona/client
cp .env.example .env
pnpm install
```

Set `VITE_GOOGLE_CLIENT_ID` in `/Users/dobruniakostrigin/front-end/Sona/client/.env` if you want Google button login.

### Run client

```bash
pnpm run dev
```
