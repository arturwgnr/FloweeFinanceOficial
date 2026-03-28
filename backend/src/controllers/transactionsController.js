const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function list(req, res) {
  try {
    const { month, year, type, category, excludeFuture, sortBy } = req.query;
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

    if (excludeFuture === "true") {
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      where.date = { ...where.date, lte: endOfToday };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: sortBy === "createdAt" ? { createdAt: "desc" } : { date: "desc" },
      include: {
        transactionTags: {
          include: { tag: { select: { id: true, name: true } } },
        },
      },
    });

    const result = transactions.map((t) => ({
      ...t,
      tags: t.transactionTags.map((tt) => tt.tag),
      transactionTags: undefined,
    }));

    res.json({ transactions: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function applyTags(transactionId, userId, tagNames) {
  if (!Array.isArray(tagNames) || tagNames.length === 0) return;

  const cleanNames = tagNames
    .map((n) => String(n).trim())
    .filter((n) => n.length > 0);

  if (cleanNames.length === 0) return;

  // Upsert each tag for this user
  const tags = await Promise.all(
    cleanNames.map((name) =>
      prisma.tag.upsert({
        where: { userId_name: { userId, name } },
        update: {},
        create: { userId, name },
      })
    )
  );

  // Create TransactionTag entries (ignore duplicates)
  await prisma.transactionTag.createMany({
    data: tags.map((tag) => ({ transactionId, tagId: tag.id })),
    skipDuplicates: true,
  });
}

async function create(req, res) {
  try {
    const { amount, type, category, description, date, recurring, tagNames } = req.body;
    if (!amount || !type || !category || !date) {
      return res
        .status(400)
        .json({ error: "amount, type, category, and date are required" });
    }
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ error: "type must be INCOME or EXPENSE" });
    }
    const [y, m, d] = date.split("-").map(Number);
    const parsedDate = new Date(y, m - 1, d);
    const isRecurring = !!recurring;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId,
        amount: parseFloat(amount),
        type,
        category,
        description: description || null,
        date: parsedDate,
        recurring: isRecurring,
        recurringDay: isRecurring ? d : null,
      },
    });

    await applyTags(transaction.id, req.userId, tagNames);

    if (isRecurring && m < 12) {
      const futureEntries = [];
      for (let futureMonth = m + 1; futureMonth <= 12; futureMonth++) {
        const daysInMonth = new Date(y, futureMonth, 0).getDate();
        const adjustedDay = Math.min(d, daysInMonth);
        futureEntries.push({
          userId: req.userId,
          amount: parseFloat(amount),
          type,
          category,
          description: description || null,
          date: new Date(y, futureMonth - 1, adjustedDay),
          recurring: true,
          recurringDay: d,
        });
      }
      if (futureEntries.length > 0) {
        await prisma.transaction.createMany({ data: futureEntries });
      }
    }

    res.status(201).json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing)
      return res.status(404).json({ error: "Transaction not found" });

    const { amount, type, category, description, date, tagNames } = req.body;
    const data = {};
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (type !== undefined) data.type = type;
    if (category !== undefined) data.category = category;
    if (description !== undefined) data.description = description;
    if (date !== undefined) {
      const [y, m, d2] = date.split("-").map(Number);
      data.date = new Date(y, m - 1, d2);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
    });

    // Replace tags if tagNames provided
    if (Array.isArray(tagNames)) {
      await prisma.transactionTag.deleteMany({ where: { transactionId: id } });
      await applyTags(id, req.userId, tagNames);
    }

    res.json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing)
      return res.status(404).json({ error: "Transaction not found" });

    await prisma.transaction.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { list, create, update, remove };
