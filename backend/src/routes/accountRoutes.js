const express = require('express');
const Account = require('../models/Account');

const router = express.Router();

// Helper: validate amount
function parseAndValidateAmount(raw) {
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  return amount;
}

// Create account
router.post('/', async (req, res) => {
  try {
    const { accountNo, holderName, initialDeposit = 0, isKYCVerified = false } = req.body;

    if (!accountNo || !holderName) {
      return res.status(400).json({ error: 'accountNo and holderName are required' });
    }

    const existing = await Account.findOne({ accountNo });
    if (existing) {
      return res.status(400).json({ error: 'Account number already exists' });
    }

    const initialBalance = parseAndValidateAmount(initialDeposit);

    const account = await Account.create({
      accountNo: String(accountNo),
      holderName: holderName.trim(),
      balance: initialBalance,
      isKYCVerified: Boolean(isKYCVerified)
    });

    return res.status(201).json({ message: 'Account created successfully', account });
  } catch (err) {
    if (err.message.includes('Amount must be')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Create account error', err);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// List all accounts
router.get('/', async (_req, res) => {
  try {
    const accounts = await Account.find().sort({ createdAt: -1 });
    return res.json({ accounts });
  } catch (err) {
    console.error('List accounts error', err);
    return res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Deposit
router.post('/:accountNo/deposit', async (req, res) => {
  try {
    const { accountNo } = req.params;
    const amount = parseAndValidateAmount(req.body.amount);

    const account = await Account.findOneAndUpdate(
      { accountNo },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json({ message: 'Deposit successful', account });
  } catch (err) {
    if (err.message.includes('Amount must be')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Deposit error', err);
    return res.status(500).json({ error: 'Failed to deposit' });
  }
});

// Withdraw
router.post('/:accountNo/withdraw', async (req, res) => {
  try {
    const { accountNo } = req.params;
    const amount = parseAndValidateAmount(req.body.amount);

    const account = await Account.findOne({ accountNo });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
    }

    account.balance -= amount;
    await account.save();

    return res.json({ message: 'Withdrawal successful', account });
  } catch (err) {
    if (err.message.includes('Amount must be')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Withdraw error', err);
    return res.status(500).json({ error: 'Failed to withdraw' });
  }
});

// Transfer
router.post('/transfer', async (req, res) => {
  const session = await Account.startSession();
  session.startTransaction();

  try {
    const { senderAccountNo, receiverAccountNo, amount } = req.body;
    const transferAmount = parseAndValidateAmount(amount);

    if (!senderAccountNo || !receiverAccountNo) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'senderAccountNo and receiverAccountNo are required' });
    }

    if (senderAccountNo === receiverAccountNo) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Sender and receiver accounts must be different' });
    }

    const sender = await Account.findOne({ accountNo: senderAccountNo }).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Sender account not found' });
    }

    if (!sender.isKYCVerified) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Sender must be KYC verified to transfer money' });
    }

    if (sender.balance < transferAmount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Sender has insufficient balance' });
    }

    const receiver = await Account.findOne({ accountNo: receiverAccountNo }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Receiver account not found' });
    }

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    await sender.save({ session });
    await receiver.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: 'Transfer successful',
      sender,
      receiver
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (err.message.includes('Amount must be')) {
      return res.status(400).json({ error: err.message });
    }

    console.error('Transfer error', err);
    return res.status(500).json({ error: 'Failed to transfer' });
  }
});

module.exports = router;

