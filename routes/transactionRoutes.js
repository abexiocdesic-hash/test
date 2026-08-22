const express = require('express');

const {
  createTransaction,
  getTransactions,
  getTransactionById
} = require('../controllers/transactionController');

const router = express.Router();

// Create transaction
router.post('/', createTransaction);

// Get all transactions
router.get('/', getTransactions);

// Get transaction by ID
router.get('/:id', getTransactionById);

module.exports = router;