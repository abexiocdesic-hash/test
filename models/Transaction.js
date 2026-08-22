const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },

    destinationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: function () {
        return this.type === 'TRANSFER';
      }
    },

    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER'],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01
    },

    currency: {
      type: String,
      default: 'ETB',
      trim: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250
    },

    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED'
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('Transaction', transactionSchema);