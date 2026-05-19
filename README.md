# Nutri-Franjo

A simple Koa.js web app with Drizzle ORM and PostgreSQL that shows the nutrition guide after the user has logged in.

## Tech Stack

- **Runtime:** Node.js 22+
- **Framework:** Koa.js
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL 17
- **Auth:** Session-based login with bcrypt

## Quick Start

1. **Start PostgreSQL**
   ```bash
   docker compose up -d
   ```

2. **Run migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed default user**
   ```bash
   node src/db/seed.js
   ```

4. **Start the app**
   ```bash
   npm run dev
   ```

5. **Open**
   http://localhost:3000

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with file watch |
| `npm start` | Start production |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
