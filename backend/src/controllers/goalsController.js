const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(req, res) {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ goals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function create(req, res) {
  try {
    const { name, targetAmount, deadline } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'name and targetAmount are required' });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.userId,
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    res.status(201).json({ goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.goal.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    const { name, targetAmount, deadline } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (targetAmount !== undefined) data.targetAmount = parseFloat(targetAmount);
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;

    const goal = await prisma.goal.update({ where: { id }, data });
    res.json({ goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.goal.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    await prisma.goal.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function addAmount(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'A positive amount is required' });
    }

    const existing = await prisma.goal.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    const goal = await prisma.goal.update({
      where: { id },
      data: { currentAmount: { increment: parseFloat(amount) } },
    });
    res.json({ goal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { list, create, update, remove, addAmount };
