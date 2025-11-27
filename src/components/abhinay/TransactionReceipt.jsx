import React from 'react';

const TransactionReceipt = ({ transaction, onClose, userData, paymentMethod }) => {
  const USD_TO_INR = 83;

  const formatCurrency = (amount) => {
    const inr = amount * USD_TO_INR;
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getTransactionId = () => {
    return `TXN${transaction._id.substring(0, 8).toUpperCase()}`;
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
╔═══════════════════════════════════════════════════════════════════╗
║                    PAYMENT RECEIPT                                ║
╚═══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSACTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction ID:    ${getTransactionId()}
Transaction Type:  ${transaction.type} Insurance Premium
Payment Date:      ${formatDate(new Date())}
Payment Status:    ✓ SUCCESSFUL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:             ${userData?.name || 'User'}
Email:            ${userData?.email || 'N/A'}
Customer ID:      ${userData?._id?.substring(0, 8).toUpperCase() || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Premium Amount:    ${formatCurrency(transaction.amount)}
GST (18%):         ${formatCurrency(transaction.amount * 0.18)}
Processing Fee:    ${formatCurrency(10)}
─────────────────────────────────────────────────────────────────
Total Paid:        ${formatCurrency(transaction.amount + (transaction.amount * 0.18) + 10)}

Payment Method:    ${paymentMethod?.toUpperCase() || 'CARD'}
Payment Gateway:   Razorpay Secure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSURANCE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Insurance Type:    ${transaction.type} Insurance
Coverage Period:   12 Months
Next Due Date:     ${formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your payment!

For any queries, please contact: support@drakz.com
Customer Care: 1800-123-4567 (Toll Free)

This is a computer-generated receipt and does not require a signature.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Receipt Generated: ${formatDate(new Date())}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${getTransactionId()}_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="transaction-receipt-modal" style={{ '--receipt-color': getTransactionColor(transaction.type) }}>
      <div className="receipt-header">
        <div className="receipt-success-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h2>Payment Successful!</h2>
        <p className="receipt-subtitle">Your payment has been processed successfully</p>
      </div>

      <div className="receipt-body">
        <div className="receipt-section transaction-info">
          <div className="receipt-row highlight">
            <span className="receipt-label">Transaction ID</span>
            <span className="receipt-value txn-id">{getTransactionId()}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Transaction Type</span>
            <span className="receipt-value">{transaction.type} Insurance Premium</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment Date</span>
            <span className="receipt-value">{formatDate(new Date())}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment Status</span>
            <span className="receipt-value status-success">
              <i className="fa-solid fa-circle-check"></i> Successful
            </span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-section customer-info">
          <h3>Customer Information</h3>
          <div className="receipt-row">
            <span className="receipt-label">Name</span>
            <span className="receipt-value">{userData?.name || 'User'}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Email</span>
            <span className="receipt-value">{userData?.email || 'N/A'}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Customer ID</span>
            <span className="receipt-value">{userData?._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-section payment-breakdown">
          <h3>Payment Breakdown</h3>
          <div className="receipt-row">
            <span className="receipt-label">Premium Amount</span>
            <span className="receipt-value">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">GST (18%)</span>
            <span className="receipt-value">{formatCurrency(transaction.amount * 0.18)}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Processing Fee</span>
            <span className="receipt-value">{formatCurrency(10)}</span>
          </div>
          <div className="receipt-row total-row">
            <span className="receipt-label">Total Paid</span>
            <span className="receipt-value amount">{formatCurrency(transaction.amount + (transaction.amount * 0.18) + 10)}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment Method</span>
            <span className="receipt-value">{paymentMethod?.toUpperCase() || 'CARD'}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Payment Gateway</span>
            <span className="receipt-value">Razorpay Secure</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-section insurance-info">
          <h3>Insurance Details</h3>
          <div className="receipt-row">
            <span className="receipt-label">Insurance Type</span>
            <span className="receipt-value">{transaction.type} Insurance</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Coverage Period</span>
            <span className="receipt-value">12 Months</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">Next Due Date</span>
            <span className="receipt-value">{formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}</span>
          </div>
        </div>

        <div className="receipt-footer-note">
          <p><strong>Thank you for your payment!</strong></p>
          <p>For any queries, please contact: <a href="mailto:support@drakz.com">support@drakz.com</a></p>
          <p>Customer Care: <strong>1800-123-4567</strong> (Toll Free)</p>
          <small>This is a computer-generated receipt and does not require a signature.</small>
        </div>
      </div>

      <div className="receipt-actions">
        <button className="modal-btn" onClick={handlePrint}>
          <i className="fa-solid fa-print"></i> Print Receipt
        </button>
        <button className="modal-btn" onClick={handleDownloadReceipt} style={{ backgroundColor: getTransactionColor(transaction.type) }}>
          <i className="fa-solid fa-download"></i> Download Receipt
        </button>
        <button className="modal-btn cancel" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;
