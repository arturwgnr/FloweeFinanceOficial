# Flowee — Project Context

## What is this

Personal finance web application. Monorepo with /frontend (React + Vite)
and /backend (Node.js + Express + Prisma + PostgreSQL).

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL (local via Docker), JWT auth
- Frontend: React (Vite), plain CSS (no Tailwind), Recharts
- AI: Google Gemini API (free tier)
- No TypeScript — plain JavaScript only

## Brand

- Name: Flowee
- Primary color: #10b77f (green)
- Background: white
- Style: premium, clean, modern, mobile-responsive

## Project Status

[x] Landing page
[x] Auth (register/login JWT)
[x] Dashboard with charts
[x] Transactions (CRUD + recurring monthly)
[x] Budgets
[x] Goals
[x] AI Insights (Gemini)
[ ] Profile page
[ ] Currency preference (USD, EUR, BRL)
[ ] Monthly budget widget on dashboard
[ ] Background blur when modals open
[ ] Landing page premium upgrade
[ ] Dashboard emoji → SVG icons
[ ] Recent transactions on dashboard

## Key Conventions

- JWT stored in localStorage
- All /api/_ routes except /api/auth/_ require auth middleware
- Categories: Food, Supermarket, Transport, Housing, Health,
  Entertainment, Shopping, Education, Travel, Other
- Charts use Recharts
- CSS follows BEM naming: block\_\_element--modifier
- All styles in /frontend/src/styles — no Tailwind, no inline styles
- API calls via axios instance in /frontend/src/services/api.js

## Environment Variables (backend .env)

- DATABASE_URL
- JWT_SECRET
- GEMINI_API_KEY

## Database Models

- User, Transaction, Budget, Goal (see schema.prisma)
