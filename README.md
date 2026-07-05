# CourtSide — Tennis Court Booking

A React + Vite frontend served by a single Express server, backed by Neon Serverless Postgres and Better Auth. Ships as one deployable process: Express serves the API under `/api` and the built frontend for everything else.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a free Postgres database at [Neon](https://neon.tech) and copy its connection string.
3. Copy `.env.example` to `.env` and fill it in:
   - `DATABASE_URL` — your Neon connection string
   - `BETTER_AUTH_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `BETTER_AUTH_URL` / `BETTER_AUTH_TRUSTED_ORIGINS` — defaults work for local dev
4. Create the Better Auth tables (user, session, account, verification):
   ```
   npm run auth:migrate
   ```
5. Create the app schema and seed the mock courts:
   ```
   npm run db:migrate
   ```
   (must run after `auth:migrate` — `bookings.user_id` references the `user` table)

## Development

```
npm run dev
```

This runs the Vite dev server (`http://localhost:5173`) alongside the Express API (`http://localhost:3001`), with `/api` requests proxied from Vite to Express.

## Production (single artifact)

```
npm run build
npm start
```

`npm start` runs one Express process that serves the built frontend (`dist/`) and the `/api` routes together on `PORT` (default `3000`). This is the single process to deploy — no separate frontend/backend to run.

## Auth

Email/password auth via [Better Auth](https://www.better-auth.com/), mounted at `/api/auth/*`. Sessions are cookie-based. Browsing courts is public; creating/cancelling a booking and viewing "My Bookings" require signing in. Cancelling is restricted to the booking's owner.

## API

- `GET /api/courts` — list courts
- `GET /api/courts/:id` — court detail
- `GET /api/bookings?courtId=&date=` — public availability (no personal info), optionally filtered
- `GET /api/bookings/mine` — the signed-in user's bookings (auth required)
- `POST /api/bookings` — create a booking `{ courtId, dateKey, hour }` (auth required; booker identity comes from the session)
- `DELETE /api/bookings/:id` — cancel a booking (auth required, owner only)
