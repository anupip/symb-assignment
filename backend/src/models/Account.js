const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountNo: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    holderName: {
      type: String,
      required: true,
      trim: true
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isKYCVerified: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);

