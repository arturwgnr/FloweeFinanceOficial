const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, changePassword };
