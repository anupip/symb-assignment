import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessagePanel } from './components/MessagePanel';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [createForm, setCreateForm] = useState({
    accountNo: '',
    holderName: '',
    initialDeposit: '',
    isKYCVerified: true
  });

  const [depositForm, setDepositForm] = useState({
    accountNo: '',
    amount: ''
  });

  const [withdrawForm, setWithdrawForm] = useState({
    accountNo: '',
    amount: ''
  });

  const [transferForm, setTransferForm] = useState({
    senderAccountNo: '',
    receiverAccountNo: '',
    amount: ''
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage('');
  };

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await axios.get(`${API_BASE}/accounts`);
      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.error(err);
      showMessage('Failed to load accounts', 'error');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      if (!createForm.accountNo || !createForm.holderName) {
        showMessage('Account number and holder name are required', 'error');
        return;
      }

      const payload = {
        accountNo: createForm.accountNo.trim(),
        holderName: createForm.holderName.trim(),
        initialDeposit: createForm.initialDeposit || 0,
        isKYCVerified: createForm.isKYCVerified
      };

      const res = await axios.post(`${API_BASE}/accounts`, payload);
      showMessage(res.data.message || 'Account created', 'success');
      setCreateForm({
        accountNo: '',
        holderName: '',
        initialDeposit: '',
        isKYCVerified: true
      });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create account';
      showMessage(msg, 'error');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      if (!depositForm.accountNo || !depositForm.amount) {
        showMessage('Account and amount are required', 'error');
        return;
      }
      const res = await axios.post(
        `${API_BASE}/accounts/${depositForm.accountNo}/deposit`,
        { amount: depositForm.amount }
      );
      showMessage(res.data.message || 'Deposit successful', 'success');
      setDepositForm({ accountNo: '', amount: '' });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to deposit';
      showMessage(msg, 'error');
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      if (!withdrawForm.accountNo || !withdrawForm.amount) {
        showMessage('Account and amount are required', 'error');
        return;
      }
      const res = await axios.post(
        `${API_BASE}/accounts/${withdrawForm.accountNo}/withdraw`,
        { amount: withdrawForm.amount }
      );
      showMessage(res.data.message || 'Withdrawal successful', 'success');
      setWithdrawForm({ accountNo: '', amount: '' });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to withdraw';
      showMessage(msg, 'error');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    clearMessage();
    try {
      const { senderAccountNo, receiverAccountNo, amount } = transferForm;
      if (!senderAccountNo || !receiverAccountNo || !amount) {
        showMessage('All fields are required for transfer', 'error');
        return;
      }
      const res = await axios.post(`${API_BASE}/accounts/transfer`, {
        senderAccountNo,
        receiverAccountNo,
        amount
      });
      showMessage(res.data.message || 'Transfer successful', 'success');
      setTransferForm({ senderAccountNo: '', receiverAccountNo: '', amount: '' });
      fetchAccounts();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to transfer';
      showMessage(msg, 'error');
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Online Bank Mini System</h1>
        <p>Simple demo app focusing on validation and transactions</p>
      </header>

      <main className="app-main">
        <div className="layout-left">
          <section className="panel">
            <h2>Open New Account</h2>
            <form className="form-grid" onSubmit={handleCreateAccount}>
              <label>
                Account Number
                <input
                  type="text"
                  value={createForm.accountNo}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, accountNo: e.target.value }))
                  }
                  placeholder="e.g. ACC1001"
                />
              </label>
              <label>
                Holder Name
                <input
                  type="text"
                  value={createForm.holderName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, holderName: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </label>
              <label>
                Initial Deposit
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={createForm.initialDeposit}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, initialDeposit: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={createForm.isKYCVerified}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, isKYCVerified: e.target.checked }))
                  }
                />
                KYC Verified
              </label>
              <button type="submit" className="primary-btn">
                Create Account
              </button>
            </form>
          </section>

          <section className="panel">
            <h2>Money Operations</h2>

            <div className="ops-row">
              <div className="ops-card">
                <h3>Deposit</h3>
                <form className="form-inline" onSubmit={handleDeposit}>
                  <input
                    type="text"
                    value={depositForm.accountNo}
                    onChange={(e) =>
                      setDepositForm((f) => ({ ...f, accountNo: e.target.value }))
                    }
                    placeholder="Account No"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositForm.amount}
                    onChange={(e) =>
                      setDepositForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="Amount"
                  />
                  <button type="submit" className="secondary-btn">
                    Deposit
                  </button>
                </form>
              </div>

              <div className="ops-card">
                <h3>Withdraw</h3>
                <form className="form-inline" onSubmit={handleWithdraw}>
                  <input
                    type="text"
                    value={withdrawForm.accountNo}
                    onChange={(e) =>
                      setWithdrawForm((f) => ({ ...f, accountNo: e.target.value }))
                    }
                    placeholder="Account No"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawForm.amount}
                    onChange={(e) =>
                      setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="Amount"
                  />
                  <button type="submit" className="secondary-btn">
                    Withdraw
                  </button>
                </form>
              </div>
            </div>

            <div className="ops-row">
              <div className="ops-card ops-card-wide">
                <h3>Transfer</h3>
                <form className="form-inline" onSubmit={handleTransfer}>
                  <input
                    type="text"
                    value={transferForm.senderAccountNo}
                    onChange={(e) =>
                      setTransferForm((f) => ({
                        ...f,
                        senderAccountNo: e.target.value
                      }))
                    }
                    placeholder="Sender Account"
                  />
                  <input
                    type="text"
                    value={transferForm.receiverAccountNo}
                    onChange={(e) =>
                      setTransferForm((f) => ({
                        ...f,
                        receiverAccountNo: e.target.value
                      }))
                    }
                    placeholder="Receiver Account"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={transferForm.amount}
                    onChange={(e) =>
                      setTransferForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    placeholder="Amount"
                  />
                  <button type="submit" className="primary-btn">
                    Transfer
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>

        <div className="layout-right">
          <section className="panel">
            <div className="panel-header">
              <h2>Accounts</h2>
              <button className="ghost-btn" onClick={fetchAccounts} disabled={loadingAccounts}>
                {loadingAccounts ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Account No</th>
                    <th>Holder Name</th>
                    <th>Balance</th>
                    <th>KYC</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '0.75rem' }}>
                        No accounts yet
                      </td>
                    </tr>
                  )}
                  {accounts.map((acc) => (
                    <tr key={acc._id}>
                      <td>{acc.accountNo}</td>
                      <td>{acc.holderName}</td>
                      <td>₹ {acc.balance.toFixed(2)}</td>
                      <td>{acc.isKYCVerified ? 'Verified' : 'Pending'}</td>
                      <td>{new Date(acc.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <h2>Messages</h2>
            <MessagePanel message={message} type={messageType} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <span>Online Bank Mini System</span>
        <span>Built with React, Node, Express &amp; MongoDB</span>
      </footer>
    </div>
  );
}

export default App;

