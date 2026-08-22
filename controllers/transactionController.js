const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Create a new transaction
const createTransaction = async (req, res, next) => {
  try {
    const {
      transactionId,
      account,
      type,
      amount,
      currency,
      description,
      status
    } = req.body;

    const transaction = await Transaction.create({
      transactionId,
      account,
      type,
      amount,
      currency,
      description,
      status
    });

    // Update account balance
    const accountRecord = await Account.findById(account);

    if (!accountRecord) {
      return res.status(404).json({
        message: 'Account not found'
      });
    }

    if (type === 'DEPOSIT') {
      accountRecord.balance += amount;
    }

    if (type === 'WITHDRAWAL') {
      if (accountRecord.balance < amount) {
        return res.status(400).json({
          message: 'Insufficient account balance'
        });
      }

      accountRecord.balance -= amount;
    }

    await accountRecord.save();

    const populatedTransaction = await Transaction
      .findById(transaction._id)
      .populate('account');

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: populatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// Get all transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction
      .find()
      .populate('account')
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// Get transaction by ID
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction
      .findById(req.params.id)
      .populate('account');

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById
};