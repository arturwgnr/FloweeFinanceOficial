const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function list(req, res) {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId },
      include: {
        transactionTags: {
          include: {
            transaction: {
              select: { amount: true, type: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = tags.map((tag) => {
      const txs = tag.transactionTags.map((tt) => tt.transaction);

      const income = txs.filter((t) => t.type === 'INCOME');
      const expense = txs.filter((t) => t.type === 'EXPENSE');

      return {
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
        income: {
          count: income.length,
          total: income.reduce((s, t) => s + t.amount, 0),
        },
        expense: {
          count: expense.length,
          total: expense.reduce((s, t) => s + t.amount, 0),
        },
        totalCount: txs.length,
      };
    });

    res.json({ tags: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
}

module.exports = { list };
