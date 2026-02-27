# Animal Shelter Adoption Portal — Backend

REST API for a dog-only animal shelter:
- Browse pets
- Submit adoption applications
- Admin approval workflow (no authentication required)

## Requirements

- Node.js 18+
- SQLite database file with schema (created by the Python seed script)

## Setup

1) Seed the database from the repo root:

```bash
python db/seeds/seed.py
```

By default, this creates: `db/shelter.sqlite`.

2) Configure environment variables:

Copy `backend/.env.example` → `backend/.env` and edit if needed.

Key variables:
- `PORT` (default: 4000)
- `DB_PATH` (default: `../db/shelter.sqlite`)
- `CORS_ORIGIN` (default: `http://localhost:5173`)
- `LOG_LEVEL` (default: `info`)

3) Run the backend:

```bash
cd backend
npm install
npm run dev
```

## Logging & Request IDs

- Structured logs via **Pino**.
- Each request gets a `requestId`:
  - taken from `x-request-id` header if provided; otherwise generated.
  - echoed back in the response header `x-request-id`.
- Most API responses include a `requestId` field in the JSON body (see docs for per-route examples).

## API documentation

- See: `docs/api.md`

This doc describes routes, request/response payloads (including pagination), and error shapes in a Swagger-style format.
