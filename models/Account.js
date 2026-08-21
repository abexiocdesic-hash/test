const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },

    accountType: {
      type: String,
      enum: ['SAVINGS', 'CHECKING'],
      required: true
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: 'ETB',
      trim: true
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED', 'CLOSED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Account', accountSchema);