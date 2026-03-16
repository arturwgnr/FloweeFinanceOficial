# Flowee — Project Context

## What is this

Personal finance web application. Monorepo with /frontend (React + Vite)
and /backend (Node.js + Express + Prisma + PostgreSQL).

## Tech Stack

- Backend: Node.js, Express, Prisma, PostgreSQL (local), JWT auth
- Frontend: React (Vite), TailwindCSS, Recharts
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
[x] Transactions (CRUD)
[x] Budgets
[x] Goals
[x] AI Insights (Gemini)

## Key Conventions

- JWT stored in localStorage
- All /api/_ routes except /api/auth/_ require auth middleware
- Categories are predefined: Food, Transport, Housing, Health,
  Entertainment, Shopping, Education, Other
- Charts use Recharts
- API calls via axios instance in /frontend/src/services/api.js

## Environment Variables (backend .env)

- DATABASE_URL
- JWT_SECRET
- GEMINI_API_KEY

## Database Models

- User, Transaction, Budget, Goal (see schema.prisma)
