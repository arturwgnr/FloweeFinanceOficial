const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', BRL: 'R$' };

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

async function getInsights(req, res) {
  try {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { preferredCurrency: true, lastInsightText: true, lastInsightDate: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.lastInsightDate && isSameDay(user.lastInsightDate, now) && user.lastInsightText) {
      return res.json({ insight: user.lastInsightText });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1),
        },
      },
    });

    if (transactions.length === 0) {
      return res.json({
        insight: 'No transactions yet this month — add some to get a personalized insight.',
      });
    }

    const currencySymbol = CURRENCY_SYMBOLS[user.preferredCurrency] || '$';

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat} ${currencySymbol}${amt.toFixed(2)}`)
      .join(', ');

    const monthName = now.toLocaleString('default', { month: 'long' });

    const prompt = `You are a friendly personal finance advisor. Analyze this user's financial summary for ${monthName} ${year} and provide 2-3 sentences of actionable, encouraging insight.

Financial Summary:
- Total income: ${currencySymbol}${totalIncome.toFixed(2)}
- Total expenses: ${currencySymbol}${totalExpenses.toFixed(2)}
- Net savings: ${currencySymbol}${(totalIncome - totalExpenses).toFixed(2)}
- Top spending categories: ${topCategories || 'No expenses recorded yet'}
- Total transactions: ${transactions.length}

Keep the tone positive and practical. Be specific with the numbers.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const result = await model.generateContent(prompt);
    const insight = result.response.text();

    await prisma.user.update({
      where: { id: req.userId },
      data: { lastInsightText: insight, lastInsightDate: now },
    });

    res.json({ insight });
  } catch (err) {
    console.error('Insights error:', err);
    if (err.status === 403) {
      return res
        .status(500)
        .json({ error: 'AI insights are temporarily unavailable (authentication issue).' });
    }
    if (err.status === 404) {
      return res
        .status(500)
        .json({ error: 'AI insights are temporarily unavailable (model issue).' });
    }
    if (err.status === 429) {
      return res.status(500).json({
        error: 'AI insights are temporarily unavailable (rate limit reached), try again later.',
      });
    }
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

module.exports = { getInsights };
