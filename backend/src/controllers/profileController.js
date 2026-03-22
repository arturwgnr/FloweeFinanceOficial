const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const VALID_CURRENCIES = ['USD', 'EUR', 'BRL'];

async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, preferredCurrency: true, monthlyBudget: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, preferredCurrency, monthlyBudget } = req.body;
    const data = {};

    if (name !== undefined) data.name = String(name).trim();
    if (preferredCurrency !== undefined) {
      if (!VALID_CURRENCIES.includes(preferredCurrency)) {
        return res.status(400).json({ error: 'Invalid currency. Must be USD, EUR, or BRL.' });
      }
      data.preferredCurrency = preferredCurrency;
    }
    if (monthlyBudget !== undefined) {
      data.monthlyBudget =
        monthlyBudget === null || monthlyBudget === '' ? null : parseFloat(monthlyBudget);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, email: true, preferredCurrency: true, monthlyBudget: true },
    });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile };
