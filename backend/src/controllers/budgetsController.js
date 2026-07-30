const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(req, res) {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const now = new Date();

    const withSpent = await Promise.all(
      budgets.map(async (budget) => {
        // Persistent (all-months) budgets have no fixed month/year — spent is
        // computed against the current month since the limit applies every month.
        const spentYear = budget.year ?? now.getFullYear();
        const spentMonth = budget.month ?? now.getMonth() + 1;
        const agg = await prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            category: budget.category,
            type: 'EXPENSE',
            date: {
              gte: new Date(spentYear, spentMonth - 1, 1),
              lt: new Date(spentYear, spentMonth, 1),
            },
          },
          _sum: { amount: true },
        });
        return { ...budget, spent: agg._sum.amount ?? 0 };
      })
    );

    res.json({ budgets: withSpent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function upsert(req, res) {
  try {
    const { category, monthlyLimit, month, year } = req.body;
    if (!category || !monthlyLimit) {
      return res.status(400).json({ error: 'category and monthlyLimit are required' });
    }
    // A budget saved without month/year applies to all months (persistent).
    const persistent = month == null || year == null;
    const parsedMonth = persistent ? null : parseInt(month);
    const parsedYear = persistent ? null : parseInt(year);

    const existing = await prisma.budget.findFirst({
      where: { userId: req.userId, category, month: parsedMonth, year: parsedYear },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { monthlyLimit: parseFloat(monthlyLimit) },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId: req.userId,
          category,
          monthlyLimit: parseFloat(monthlyLimit),
          month: parsedMonth,
          year: parsedYear,
        },
      });
    }

    res.json({ budget });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Budget not found' });

    await prisma.budget.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { list, upsert, remove };
