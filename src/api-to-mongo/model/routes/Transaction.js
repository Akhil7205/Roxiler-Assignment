const express = require('express');
const router = express.Router();
const Transaction = require('../Transaction.js');
// import Transaction from '../models/Transaction';


// Initialize the database with seed data
router.get('/seed', async (req, res) => {
  try {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await response.json();
    await Transaction.insertMany(data);
    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Fetch all transactions with search, pagination, and month filter
router.get('/transactions', async (req, res) => {
  const { search = '', page = 1, perPage = 10, month } = req.query;
  const skip = (page - 1) * perPage;
  const regex = new RegExp(search, 'i');

  let query = { $or: [{ title: regex }, { description: regex }, { price: regex }] };

  if (month) {
    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(`${month}-31`);
    query.dateOfSale = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query).skip(skip).limit(parseInt(perPage));

  res.status(200).json({ total, data: transactions });
});

// Fetch statistics for a given month
router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const startOfMonth = new Date(`${month}-01`);
  const endOfMonth = new Date(`${month}-31`);

  const totalSold = await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lte: endOfMonth }, sold: true });
  const totalNotSold = await Transaction.countDocuments({ dateOfSale: { $gte: startOfMonth, $lte: endOfMonth }, sold: false });
  const totalSaleAmount = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth }, sold: true } },
    { $group: { _id: null, total: { $sum: '$price' } } }
  ]);

  res.status(200).json({
    totalSaleAmount: totalSaleAmount[0]?.total || 0,
    totalSold,
    totalNotSold
  });
});

module.exports = router;
