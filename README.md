# VLU EMRS

Electronic Medical Record System for the Nursing Faculty at Van Lang University.

This repository contains a Go Echo backend, a React Vite frontend, Microsoft Entra ID login, and a PostgreSQL database schema compatible with the existing HMS data model.

## Project layout

```txt
.
├── GO/       # Go Echo backend
└── client/   # React + Vite frontend
```

## Current stack

- Backend: Go, Echo, pgx
- Frontend: React, TypeScript, Vite
- Database: PostgreSQL
- Login: Microsoft Entra ID
- Token validation: Microsoft JWKS + access token claims
- Object storage: MinIO will be added later

## Run backend

Initialize database:

```bash
cd GO
go run ./cmd/db init
```

Start API:

```bash
cd GO
go run ./cmd/api
```

Expected log:

```txt
server listening on http://localhost:5002
```

Health check:

```bash
curl http://localhost:5002/healthz
```

Expected response:

```json
{"status":"ok"}
```

## Run frontend

```bash
cd client
npm install
npm run dev
```

The frontend should run on:

```txt
https://localhost:5173
```

## Notes

- MinIO/object storage is planned for later medical attachments work.
- Do not commit real `.env` files or secrets.
