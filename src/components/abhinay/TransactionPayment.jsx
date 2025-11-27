import React, { useState } from 'react';

const TransactionPayment = ({ transaction, onClose, onPaymentComplete, userData }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const USD_TO_INR = 83;

  const formatCurrency = (amount) => {
    const inr = amount * USD_TO_INR;
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTransactionColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'auto': return '#3b82f6';
      case 'health': return '#ef4444';
      case 'life': return '#22c55e';
      case 'home': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    // Validate payment details
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardName || cardName.trim().length < 3) {
        setError('Please enter cardholder name');
        return;
      }
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError('Please enter expiry date in MM/YY format');
        return;
      }
      if (!cvv || cvv.length !== 3) {
        setError('Please enter valid 3-digit CVV');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID');
        return;
      }
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      onPaymentComplete(transaction._id, paymentMethod);
      setProcessing(false);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="transaction-payment-modal" style={{ '--payment-color': getTransactionColor(transaction.type) }}>
      <div className="payment-header">
        <div className="payment-icon" style={{ backgroundColor: `${getTransactionColor(transaction.type)}15`, color: getTransactionColor(transaction.type) }}>
          <i className="fa-solid fa-credit-card"></i>
        </div>
        <div className="payment-title">
          <h2>Pay Insurance Premium</h2>
          <p className="payment-subtitle">{transaction.type} Insurance</p>
        </div>
      </div>

      <div className="payment-body">
        <div className="payment-summary">
          <h3>Payment Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Amount Due</span>
              <span className="summary-value amount">{formatCurrency(transaction.amount)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Due Date</span>
              <span className="summary-value">{formatDate(transaction.date)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Status</span>
              <span className="summary-value status-badge status-pending">
                <i className="fa-solid fa-clock"></i> {transaction.status}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <div className="payment-method-selector">
            <h3>Select Payment Method</h3>
            <div className="method-buttons">
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <i className="fa-solid fa-credit-card"></i>
                <span>Card</span>
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <i className="fa-solid fa-mobile-screen"></i>
                <span>UPI</span>
              </button>
              <button
                type="button"
                className={`method-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <i className="fa-solid fa-building-columns"></i>
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {error && <div className="payment-error">{error}</div>}

          {paymentMethod === 'card' && (
            <div className="card-details">
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardName">Cardholder Name</label>
                <input
                  id="cardName"
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date</label>
                  <input
                    id="expiryDate"
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="upi-details">
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  id="upiId"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
              <div className="upi-apps">
                <p>Popular UPI Apps:</p>
                <div className="upi-app-buttons">
                  <button type="button" className="upi-app-btn">
                    <i className="fa-brands fa-google-pay"></i> GPay
                  </button>
                  <button type="button" className="upi-app-btn">
                    <i className="fa-solid fa-mobile"></i> PhonePe
                  </button>
                  <button type="button" className="upi-app-btn">
                    <i className="fa-solid fa-money-bill"></i> Paytm
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div className="netbanking-details">
              <div className="form-group">
                <label htmlFor="bank">Select Bank</label>
                <select id="bank" className="bank-select">
                  <option value="">Choose your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="bob">Bank of Baroda</option>
                </select>
              </div>
            </div>
          )}

          <div className="payment-footer">
            <button type="button" className="modal-btn cancel" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-btn confirm" 
              style={{ backgroundColor: getTransactionColor(transaction.type) }}
              disabled={processing}
            >
              {processing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock"></i> Pay {formatCurrency(transaction.amount)}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionPayment;
