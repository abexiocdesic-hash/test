const Account = require('../models/Account');

// Create a new account
const createAccount = async (req, res, next) => {
  try {
    const {
      accountNumber,
      accountHolderName,
      accountType,
      balance,
      currency
    } = req.body;

    const account = await Account.create({
      accountNumber,
      accountHolderName,
      accountType,
      balance,
      currency
    });

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    next(error);
  }
};

// Get all accounts
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().sort({ createdAt: -1 });

    res.status(200).json(accounts);
  } catch (error) {
    next(error);
  }
};

// Get account by ID
const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        message: 'Account not found'
      });
    }

    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountById
};