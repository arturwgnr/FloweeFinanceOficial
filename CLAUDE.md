# Flowee — Project Context

## What is this
Personal finance web application. Monorepo with /frontend (React + Vite)
and /backend (Node.js + Express + Prisma + PostgreSQL).

## Tech Stack
- Backend: Node.js, Express, Prisma, PostgreSQL (local via Docker), JWT auth
- Frontend: React (Vite), plain CSS (no Tailwind), Recharts, lucide-react
- AI: Google Gemini API (free tier)
- No TypeScript — plain JavaScript only

## Brand
- Name: Flowee
- Primary color: #10b77f (green)
- Background: white
- Style: premium, clean, modern, mobile-responsive

## Project Status
[x] Landing page (premium upgrade applied)
[x] Auth (register/login JWT)
[x] Dashboard with charts
[x] Dashboard month navigation (prev/next month)
[x] Dashboard stat cards with trend indicators
[x] Dashboard budget mini widget
[x] Dashboard active goals progress
[x] Dashboard recent transactions (scrollable, editable)
[x] Dashboard hide/show balance toggle
[x] Transactions (CRUD + recurring monthly)
[x] Transactions sort by recently added
[x] Transactions delete confirmation
[x] Budgets
[x] Goals
[x] AI Insights (Gemini)
[x] Profile page
[x] Profile change password
[x] Profile currency preference (USD, EUR, BRL)
[x] Profile custom categories (INCOME + EXPENSE)
[x] Monthly budget widget on dashboard
[x] Background blur when modals open (via ReactDOM.createPortal)
[x] Transaction tags replaced with marked/starred system
[x] Marked transactions page (/marked)
[x] Year Overview page (/year-overview)
[x] iPad responsive layout
[ ] Deploy (Render + Supabase)
[ ] Recurring transaction edit/remove future occurrences
[ ] Keep open fix across all pages

## Key Conventions
- JWT stored in localStorage
- All /api/* routes except /api/auth/* require auth middleware
- Categories are dynamic per user — fetched from GET /api/categories
  (no hardcoded arrays on frontend except as fallback defaults)
- Income categories default: Salary, Investment, Freelance, Payback, Gift, Other
- Expense categories default: Food, Supermarket, Transport, Housing, Health,
  Entertainment, Shopping, Education, Travel, Other
- Charts use Recharts
- CSS follows BEM naming: block__element--modifier
- All styles in /frontend/src/styles — no Tailwind, no inline styles
- All modals use ReactDOM.createPortal
- API calls via axios instance in /frontend/src/services/api.js
- Currency symbol is dynamic from user profile (USD, EUR, BRL)

## Environment Variables (backend .env)
- DATABASE_URL
- JWT_SECRET
- GEMINI_API_KEY
- PORT=5000

## Database Models
- User: id, name, email, password, preferredCurrency, monthlyBudget, createdAt
- Transaction: id, userId, amount, type, category, description, date,
  recurring, recurringDay, recurringGroupId, marked, createdAt
- Budget: id, userId, category, monthlyLimit, month, year
- Goal: id, userId, name, targetAmount, currentAmount, deadline, createdAt
- Category: id, userId, name, type (INCOME|EXPENSE), createdAt