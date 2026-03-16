const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

async function getInsights(req, res) {
  try {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1),
        },
      },
    });

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
      .map(([cat, amt]) => `${cat} $${amt.toFixed(2)}`)
      .join(', ');

    const monthName = now.toLocaleString('default', { month: 'long' });

    const prompt = `You are a friendly personal finance advisor. Analyze this user's financial summary for ${monthName} ${year} and provide 2-3 sentences of actionable, encouraging insight.

Financial Summary:
- Total income: $${totalIncome.toFixed(2)}
- Total expenses: $${totalExpenses.toFixed(2)}
- Net savings: $${(totalIncome - totalExpenses).toFixed(2)}
- Top spending categories: ${topCategories || 'No expenses recorded yet'}
- Total transactions: ${transactions.length}

Keep the tone positive and practical. Be specific with the numbers.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const insight = result.response.text();

    res.json({ insight });
  } catch (err) {
    console.error('Insights error:', err);
    if (err.message && err.message.includes('API_KEY')) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

module.exports = { getInsights };
