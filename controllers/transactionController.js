const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Create a new transaction
const createTransaction = async (req, res, next) => {
  try {
    const {
      transactionId,
      account,
      destinationAccount,
      type,
      amount,
      currency,
      description,
      status
    } = req.body;

    // Validate account ID
if (!mongoose.Types.ObjectId.isValid(account)) {
  return res.status(400).json({
    message: 'Invalid source account ID'
  });
}

// Validate destination account ID for transfers
if (
  type === 'TRANSFER' &&
  !mongoose.Types.ObjectId.isValid(destinationAccount)
) {
  return res.status(400).json({
    message: 'Invalid destination account ID'
  });
}
   // Validate amount
if (
  typeof amount !== 'number' ||
  !Number.isFinite(amount) ||
  amount <= 0
) {
  return res.status(400).json({
    message: 'Transaction amount must be a positive number'
  });
}

    // Validate transaction type
    const allowedTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid transaction type'
      });
    }

    // TRANSFER
    if (type === 'TRANSFER') {
      const session = await mongoose.startSession();

      try {
        let createdTransaction;

        await session.withTransaction(async () => {
          const sourceAccount = await Account.findById(account)
            .session(session);

          if (!sourceAccount) {
            const error = new Error('Source account not found');
            error.status = 404;
            throw error;
          }

          if (!destinationAccount) {
            const error = new Error(
              'Destination account is required for transfers'
            );
            error.status = 400;
            throw error;
          }

          if (account.toString() === destinationAccount.toString()) {
            const error = new Error(
              'Source and destination accounts must be different'
            );
            error.status = 400;
            throw error;
          }

          const targetAccount = await Account.findById(destinationAccount)
            .session(session);

          if (!targetAccount) {
            const error = new Error(
              'Destination account not found'
            );
            error.status = 404;
            throw error;
          }

          if (sourceAccount.balance < amount) {
            const error = new Error(
              'Insufficient account balance'
            );
            error.status = 400;
            throw error;
          }

          // Update both balances
          sourceAccount.balance -= amount;
          targetAccount.balance += amount;

          await sourceAccount.save({ session });
          await targetAccount.save({ session });

          // Create transaction record
          const transactions = await Transaction.create(
            [{
              transactionId,
              account,
              destinationAccount,
              type,
              amount,
              currency,
              description,
              status
            }],
            { session }
          );

          createdTransaction = transactions[0];
        });

        const populatedTransaction = await Transaction
          .findById(createdTransaction._id)
          .populate('account')
          .populate('destinationAccount');

        return res.status(201).json({
          message: 'Transfer completed successfully',
          transaction: populatedTransaction
        });

      } finally {
        await session.endSession();
      }
    }

    // DEPOSIT / WITHDRAWAL
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

    const transaction = await Transaction.create({
      transactionId,
      account,
      type,
      amount,
      currency,
      description,
      status
    });

    const populatedTransaction = await Transaction
      .findById(transaction._id)
      .populate('account')
      .populate('destinationAccount');

    return res.status(201).json({
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
      .populate('destinationAccount')
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
      .populate('account')
      .populate('destinationAccount');

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