import React from 'react';

const InsuranceDetails = ({ insurance, onClose, userData }) => {
  const USD_TO_INR = 83;
  
  const formatCurrency = (amount) => {
    const inr = amount * USD_TO_INR;
    return `₹${inr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateMonthlyPremium = (annual) => {
    const monthly = (annual / 12) * USD_TO_INR;
    return monthly.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const getInsuranceIcon = (type) => {
    switch(type) {
      case 'Auto': return 'fa-car';
      case 'Health': return 'fa-heart-pulse';
      case 'Life': return 'fa-user-shield';
      case 'Home': return 'fa-house';
      default: return 'fa-shield-halved';
    }
  };

  const getInsuranceColor = (type) => {
    switch(type.toLowerCase()) {
      case 'auto': return '#3b82f6'; // Blue
      case 'health': return '#ef4444'; // Red
      case 'life': return '#22c55e'; // Green
      case 'home': return '#f59e0b'; // Orange
      default: return '#8b5cf6'; // Purple
    }
  };

  const getPolicyNumber = () => {
    return `POL-${insurance._id.substring(0, 8).toUpperCase()}`;
  };

  const getNextDueDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return formatDate(nextMonth);
  };

  const handleDownloadPolicy = () => {
    // Create policy document content
    const policyContent = `
╔═══════════════════════════════════════════════════════════════════╗
║                    INSURANCE POLICY DOCUMENT                      ║
╚═══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POLICY HOLDER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:             ${userData?.name || 'User'}
Email:            ${userData?.email || 'N/A'}
Policy Number:    ${getPolicyNumber()}
Policy Type:      ${insurance.type} Insurance
Provider:         ${insurance.provider}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVERAGE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Coverage Amount:  ${formatCurrency(insurance.coverageAmount)}
Start Date:       ${formatDate(insurance.startDate)}
End Date:         ${formatDate(insurance.endDate) || 'Active'}
Status:           Active

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Annual Premium:   ${formatCurrency(insurance.premium)}
Monthly Premium:  ₹${calculateMonthlyPremium(insurance.premium)}
Next Payment:     ${getNextDueDate()}
Payment Method:   Auto-Pay Enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY BENEFITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${insurance.type === 'Auto' ? `✓ Collision Coverage
✓ Comprehensive Coverage
✓ Liability Protection
✓ 24/7 Roadside Assistance` : ''}${insurance.type === 'Health' ? `✓ Hospitalization Coverage
✓ Preventive Care
✓ Prescription Drugs
✓ Emergency Services` : ''}${insurance.type === 'Life' ? `✓ Death Benefit
✓ Cash Value Accumulation
✓ Tax Benefits
✓ Flexible Premiums` : ''}${insurance.type === 'Home' ? `✓ Property Damage Coverage
✓ Personal Liability
✓ Natural Disaster Protection
✓ Theft Coverage` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Document Generated: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

This is an official policy document. Please retain for your records.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    // Create blob and download
    const blob = new Blob([policyContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${insurance.type}_Insurance_Policy_${getPolicyNumber()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="insurance-details-modal" style={{ '--header-color': getInsuranceColor(insurance.type) }}>
      <div className="insurance-details-header">
        <div className="insurance-details-icon" style={{ backgroundColor: `${getInsuranceColor(insurance.type)}15`, color: getInsuranceColor(insurance.type) }}>
          <i className={`fa-solid ${getInsuranceIcon(insurance.type)}`}></i>
        </div>
        <div className="insurance-details-title">
          <h2>{insurance.type} Insurance</h2>
          <p className="provider-name">{insurance.provider}</p>
        </div>
      </div>

      <div className="insurance-details-body">
        <div className="detail-section">
          <h3>Policy Holder Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{userData?.name || 'User'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData?.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Policy Number</span>
              <span className="detail-value policy-number">{getPolicyNumber()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Policy Type</span>
              <span className="detail-value">{insurance.type}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Coverage Details</h3>
          <div className="detail-grid">
            <div className="detail-item highlighted">
              <span className="detail-label">Coverage Amount</span>
              <span className="detail-value amount">{formatCurrency(insurance.coverageAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{formatDate(insurance.startDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">End Date</span>
              <span className="detail-value">{formatDate(insurance.endDate) || 'Active'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value status-active">
                <i className="fa-solid fa-circle-check"></i> Active
              </span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Payment Information</h3>
          <div className="detail-grid">
            <div className="detail-item highlighted">
              <span className="detail-label">Annual Premium</span>
              <span className="detail-value amount">{formatCurrency(insurance.premium)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Monthly Premium</span>
              <span className="detail-value">₹{calculateMonthlyPremium(insurance.premium)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Next Payment Due</span>
              <span className="detail-value">{getNextDueDate()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Method</span>
              <span className="detail-value">Auto-Pay Enabled</span>
            </div>
          </div>
        </div>

        <div className="detail-section benefits-section">
          <h3>Key Benefits</h3>
          <div className="benefits-list">
            {insurance.type === 'Auto' && (
              <>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Collision Coverage</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Comprehensive Coverage</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Liability Protection</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>24/7 Roadside Assistance</span>
                </div>
              </>
            )}
            {insurance.type === 'Health' && (
              <>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Hospitalization Coverage</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Preventive Care</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Prescription Drugs</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Emergency Services</span>
                </div>
              </>
            )}
            {insurance.type === 'Life' && (
              <>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Death Benefit</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Cash Value Accumulation</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Tax Benefits</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Flexible Premiums</span>
                </div>
              </>
            )}
            {insurance.type === 'Home' && (
              <>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Property Damage Coverage</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Personal Liability</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Natural Disaster Protection</span>
                </div>
                <div className="benefit-item">
                  <i className="fa-solid fa-check"></i>
                  <span>Theft Coverage</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="insurance-details-footer">
        <button className="modal-btn cancel" onClick={onClose}>
          Close
        </button>
        <button className="modal-btn" style={{ backgroundColor: getInsuranceColor(insurance.type) }} onClick={handleDownloadPolicy}>
          <i className="fa-solid fa-file-pdf"></i> Download Policy
        </button>
      </div>
    </div>
  );
};

export default InsuranceDetails;
