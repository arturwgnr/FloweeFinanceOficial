const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', BRL: 'R$' };
const TOKEN_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const GEMINI_MODEL = 'gemini-flash-latest';

const SYSTEM_PROMPTS = {
  SUGGESTION:
    "You are Flowee's financial assistant. Based on the data below, identify ONE concrete, actionable step the user can take, grounded in an actual pattern you see in their data (a specific category, a specific number, a specific habit). Be specific — reference real numbers and categories from the data, not generic advice. Write 2-4 sentences. Do not use markdown formatting.",
  BLIND_SPOT:
    "You are Flowee's financial assistant. Based on the data below, identify something the user is likely NOT noticing — a hidden pattern, an underestimated category, or a recurring behaviour that isn't obvious at first glance. Point it out directly with the specific numbers behind it. Write 2-4 sentences. Do not use markdown formatting.",
  COLD_ANALYSIS:
    "You are Flowee's financial assistant. Give a direct, unfiltered read of this month's numbers. No encouragement, no softening, no motivational language — only what the data says. State facts and figures plainly. Write 2-4 sentences. Do not use markdown formatting.",
};

const ANNUAL_SYSTEM_PROMPT =
  "You are Flowee's financial assistant. Analyse the user's full year of financial data below across all months. If fewer than 3 months have transaction data, say so explicitly and only analyse the months that exist — do not extrapolate a full-year trend from insufficient data. Identify overall income/expense trends, the biggest spending categories across the year, and any notable shifts month to month. Write 3-6 sentences. Do not use markdown formatting.";

function formatMonthLabel(month, year) {
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

async function getTokenWindow(userId) {
  const now = new Date();
  const latest = await prisma.dailyTokenUsage.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  if (!latest || now.getTime() - latest.date.getTime() >= WINDOW_MS) {
    return { record: null, tokensUsed: 0, resetAt: null };
  }
  return {
    record: latest,
    tokensUsed: latest.tokensUsed,
    resetAt: new Date(latest.date.getTime() + WINDOW_MS),
  };
}

async function consumeToken(userId, windowState) {
  if (windowState.record) {
    return prisma.dailyTokenUsage.update({
      where: { id: windowState.record.id },
      data: { tokensUsed: { increment: 1 } },
    });
  }
  return prisma.dailyTokenUsage.create({
    data: { userId, date: new Date(), tokensUsed: 1 },
  });
}

async function buildMonthContext(userId, month, year) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredCurrency: true, monthlyBudget: true },
  });
  const currencySymbol = CURRENCY_SYMBOLS[user?.preferredCurrency] || '$';

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) },
    },
    orderBy: { date: 'asc' },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId, OR: [{ month, year }, { month: null, year: null }] },
  });

  const allGoals = await prisma.goal.findMany({ where: { userId } });
  const activeGoals = allGoals.filter((g) => g.currentAmount < g.targetAmount);

  const categories = await prisma.category.findMany({ where: { userId } });

  return {
    currencySymbol,
    monthlyBudget: user?.monthlyBudget,
    transactions,
    budgets,
    activeGoals,
    categories,
  };
}

function buildContextBlock(ctx, monthLabel, now, isCurrentMonth) {
  const { currencySymbol, monthlyBudget, transactions, budgets, activeGoals, categories } = ctx;

  const income = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const categoryTotals = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
  const categoryLines =
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ${currencySymbol}${amt.toFixed(2)}`)
      .join('\n') || '  (no expenses recorded)';

  const txLines =
    transactions
      .map(
        (t) =>
          `  - ${t.date.toISOString().slice(0, 10)} | ${t.type} | ${t.category} | ${currencySymbol}${t.amount.toFixed(2)}${t.description ? ` | ${t.description}` : ''}`,
      )
      .join('\n') || '  (no transactions)';

  const budgetLines =
    budgets.map((b) => `  - ${b.category}: limit ${currencySymbol}${b.monthlyLimit.toFixed(2)}`).join('\n') ||
    '  (no budgets set)';

  const goalLines =
    activeGoals
      .map(
        (g) =>
          `  - ${g.name}: ${currencySymbol}${g.currentAmount.toFixed(2)} of ${currencySymbol}${g.targetAmount.toFixed(2)}${g.deadline ? ` (deadline ${g.deadline.toISOString().slice(0, 10)})` : ''}`,
      )
      .join('\n') || '  (no active goals)';

  const categoryNames = categories.map((c) => c.name).join(', ') || 'none defined';

  const partialWarning = isCurrentMonth
    ? `\nIMPORTANT: Today is ${now.toDateString()}. This month (${monthLabel}) is NOT over. The transaction data below is partial — only ${now.getDate()} day(s) into the month. Do not draw conclusions as if the month is complete. Frame any totals as "so far this month".\n`
    : '';

  return `Today's date: ${now.toDateString()}
Analysis period: ${monthLabel}
${partialWarning}
Financial summary for ${monthLabel}:
- Total income: ${currencySymbol}${income.toFixed(2)}
- Total expenses: ${currencySymbol}${expenses.toFixed(2)}
- Net: ${currencySymbol}${(income - expenses).toFixed(2)}
- Overall monthly budget: ${monthlyBudget ? `${currencySymbol}${monthlyBudget.toFixed(2)}` : 'not set'}

Expenses by category:
${categoryLines}

Category budgets:
${budgetLines}

Active goals:
${goalLines}

User's custom categories: ${categoryNames}

Raw transactions (${transactions.length}):
${txLines}`;
}

function mapGeminiError(err, res, fallbackMessage) {
  if (err.status === 403) {
    return res.status(500).json({ error: 'AI insights are temporarily unavailable (authentication issue).' });
  }
  if (err.status === 404) {
    return res.status(500).json({ error: 'AI insights are temporarily unavailable (model issue).' });
  }
  if (err.status === 429) {
    return res
      .status(500)
      .json({ error: 'AI insights are temporarily unavailable (rate limit reached), try again later.' });
  }
  return res.status(500).json({ error: fallbackMessage });
}

async function generate(req, res) {
  try {
    const { type, month, year } = req.body;
    if (!['SUGGESTION', 'BLIND_SPOT', 'COLD_ANALYSIS'].includes(type)) {
      return res.status(400).json({ error: 'type must be SUGGESTION, BLIND_SPOT, or COLD_ANALYSIS' });
    }
    const m = parseInt(month);
    const y = parseInt(year);
    if (!m || !y) {
      return res.status(400).json({ error: 'month and year are required' });
    }

    const windowState = await getTokenWindow(req.userId);
    if (windowState.tokensUsed >= TOKEN_LIMIT) {
      return res.status(429).json({
        error: 'Daily analysis limit reached',
        tokensRemaining: 0,
        resetAt: windowState.resetAt,
      });
    }

    const now = new Date();
    const isCurrentMonth = m === now.getMonth() + 1 && y === now.getFullYear();
    const monthLabel = formatMonthLabel(m, y);

    const context = await buildMonthContext(req.userId, m, y);
    const contextBlock = buildContextBlock(context, monthLabel, now, isCurrentMonth);
    const prompt = `${SYSTEM_PROMPTS[type]}\n\n${contextBlock}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await geminiModel.generateContent(prompt);
    const insight = result.response.text();

    const saved = await prisma.insightHistory.create({
      data: { userId: req.userId, type, content: insight, month: m, year: y },
    });

    const record = await consumeToken(req.userId, windowState);
    const tokensRemaining = Math.max(0, TOKEN_LIMIT - record.tokensUsed);

    res.json({ insight, tokensRemaining, createdAt: saved.createdAt });
  } catch (err) {
    console.error('Insights generate error:', err);
    mapGeminiError(err, res, 'Failed to generate insight');
  }
}

async function getHistory(req, res) {
  try {
    const { month, year } = req.query;
    const where = { userId: req.userId };
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    const history = await prisma.insightHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getTokens(req, res) {
  try {
    const windowState = await getTokenWindow(req.userId);
    res.json({
      tokensUsed: windowState.tokensUsed,
      tokensRemaining: Math.max(0, TOKEN_LIMIT - windowState.tokensUsed),
      resetAt: windowState.resetAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function buildAnnualContext(userId, year) {
  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
    orderBy: { date: 'asc' },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferredCurrency: true } });
  const currencySymbol = CURRENCY_SYMBOLS[user?.preferredCurrency] || '$';

  const monthsWithData = new Set(transactions.map((t) => new Date(t.date).getMonth() + 1));

  const monthlySummaries = [];
  for (let m = 1; m <= 12; m++) {
    const monthTx = transactions.filter((t) => new Date(t.date).getMonth() + 1 === m);
    if (monthTx.length === 0) continue;
    const income = monthTx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const label = new Date(year, m - 1, 1).toLocaleString('en-US', { month: 'long' });
    monthlySummaries.push(
      `  - ${label}: income ${currencySymbol}${income.toFixed(2)}, expenses ${currencySymbol}${expenses.toFixed(2)}`,
    );
  }

  return { monthsWithData, monthlySummaries };
}

async function annual(req, res) {
  try {
    const { year } = req.body;
    const y = parseInt(year);
    if (!y) return res.status(400).json({ error: 'year is required' });

    const windowState = await getTokenWindow(req.userId);
    if (windowState.tokensUsed >= TOKEN_LIMIT) {
      return res.status(429).json({
        error: 'Daily analysis limit reached',
        tokensRemaining: 0,
        resetAt: windowState.resetAt,
      });
    }

    const now = new Date();
    const { monthsWithData, monthlySummaries } = await buildAnnualContext(req.userId, y);

    if (monthsWithData.size === 0) {
      return res.status(400).json({ error: `No transaction data found for ${y}` });
    }

    const allMonthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(y, i, 1).toLocaleString('en-US', { month: 'long' }),
    );
    const monthsWithoutData = allMonthNames.filter((_, i) => !monthsWithData.has(i + 1));

    const contextBlock = `Today's date: ${now.toDateString()}
Analysis year: ${y}
Months with transaction data (${monthsWithData.size} of 12):
${monthlySummaries.join('\n')}
Months with NO transaction data: ${monthsWithoutData.length ? monthsWithoutData.join(', ') : 'none'}`;

    const prompt = `${ANNUAL_SYSTEM_PROMPT}\n\n${contextBlock}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await geminiModel.generateContent(prompt);
    const insight = result.response.text();

    const saved = await prisma.insightHistory.create({
      data: { userId: req.userId, type: 'ANNUAL', content: insight, month: null, year: y },
    });

    const record = await consumeToken(req.userId, windowState);
    const tokensRemaining = Math.max(0, TOKEN_LIMIT - record.tokensUsed);

    res.json({ insight, tokensRemaining, createdAt: saved.createdAt });
  } catch (err) {
    console.error('Insights annual error:', err);
    mapGeminiError(err, res, 'Failed to generate annual analysis');
  }
}

module.exports = { generate, getHistory, getTokens, annual };
