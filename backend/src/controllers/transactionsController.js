const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Other'];

async function list(req, res) {
  try {
    const { month, year, type, category } = req.query;
    const where = { userId: req.userId };

    if (type) where.type = type;
    if (category) where.category = category;

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lt: new Date(y, m, 1),
      };
    } else if (year) {
      const y = parseInt(year);
      where.date = {
        gte: new Date(y, 0, 1),
        lt: new Date(y + 1, 0, 1),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const { amount, type, category, description, date } = req.body;
    if (!amount || !type || !category || !date) {
      return res.status(400).json({ error: 'amount, type, category, and date are required' });
    }
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ error: 'type must be INCOME or EXPENSE' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const [y, m, d] = date.split('-').map(Number);
    const parsedDate = new Date(y, m - 1, d);

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId,
        amount: parseFloat(amount),
        type,
        category,
        description: description || null,
        date: parsedDate,
      },
    });
    res.status(201).json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    const { amount, type, category, description, date } = req.body;
    const data = {};
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (type !== undefined) data.type = type;
    if (category !== undefined) data.category = category;
    if (description !== undefined) data.description = description;
    if (date !== undefined) {
      const [y, m, d2] = date.split('-').map(Number);
      data.date = new Date(y, m - 1, d2);
    }

    const transaction = await prisma.transaction.update({ where: { id }, data });
    res.json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { list, create, update, remove };
