require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');
const budgetRoutes = require('./src/routes/budgets');
const goalRoutes = require('./src/routes/goals');
const insightRoutes = require('./src/routes/insights');
const profileRoutes = require('./src/routes/profile');
const categoryRoutes = require('./src/routes/categories');
const tagRoutes = require('./src/routes/tags');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Flowee API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);

app.listen(PORT, () => {
  console.log(`Flowee backend running on port ${PORT}`);
});
