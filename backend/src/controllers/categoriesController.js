const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_EXPENSE = [
  "Food", "Supermarket", "Transport", "Housing", "Health",
  "Entertainment", "Shopping", "Education", "Travel", "Other",
];

const DEFAULT_INCOME = [
  "Salary", "Investment", "Freelance", "Payback", "Gift", "Other",
];

async function ensureDefaults(userId) {
  const count = await prisma.category.count({ where: { userId } });
  if (count === 0) {
    const data = [
      ...DEFAULT_EXPENSE.map((name) => ({ userId, name, type: "EXPENSE" })),
      ...DEFAULT_INCOME.map((name) => ({ userId, name, type: "INCOME" })),
    ];
    await prisma.category.createMany({ data, skipDuplicates: true });
  }
}

async function list(req, res) {
  try {
    await ensureDefaults(req.userId);
    const all = await prisma.category.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "asc" },
    });
    const categories = { EXPENSE: [], INCOME: [] };
    all.forEach((c) => {
      if (categories[c.type]) categories[c.type].push(c);
    });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function create(req, res) {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: "name and type are required" });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ error: "type must be INCOME or EXPENSE" });
    }
    const trimmed = name.trim();
    if (!trimmed) return res.status(400).json({ error: "name cannot be empty" });

    const category = await prisma.category.create({
      data: { userId: req.userId, name: trimmed, type },
    });
    res.status(201).json({ category });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Category already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: "Category not found" });

    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "name cannot be empty" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    res.json({ category });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: "Category not found" });

    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { list, create, update, remove };
