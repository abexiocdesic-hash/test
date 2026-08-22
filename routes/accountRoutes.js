const express = require('express');

const {
  createAccount,
  getAccounts,
  getAccountById
} = require('../controllers/accountController');

const router = express.Router();

// Create account
router.post('/', createAccount);

// Get all accounts
router.get('/', getAccounts);

// Get account by ID
router.get('/:id', getAccountById);

module.exports = router;