// Router-level validation middleware for Settings routes
// Validates request bodies before hitting controllers

const validateProfileUpdate = (req, res, next) => {
  const { name, phone, occupation } = req.body || {};
  const errors = {};

  const trimmedName = (name || "").toString().trim();
  if (trimmedName) {
    if (trimmedName.length < 2)
      errors.name = "Name must be at least 2 characters";
    else if (trimmedName.length > 100)
      errors.name = "Name must be under 100 characters";
    else if (!/^[a-zA-Z\s]+$/.test(trimmedName))
      errors.name = "Name can only contain letters and spaces";
  }

  if (phone !== undefined && phone !== null) {
    const phoneRaw = phone.toString().trim();
    if (phoneRaw) {
      if (!/^[0-9+\-\s()]+$/.test(phoneRaw)) {
        errors.phone = "Phone number contains invalid characters";
      } else {
        const digits = phoneRaw.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) {
          errors.phone = "Enter a valid phone number (10–15 digits)";
        }
      }
    }
  }

  if (occupation !== undefined && occupation !== null) {
    if (/\d/.test(occupation))
      errors.occupation = "Occupation cannot contain numbers";
    else if (!/^[a-zA-Z\s]+$/.test(occupation))
      errors.occupation = "Occupation can only contain letters and spaces";
    else if (occupation.length > 200)
      errors.occupation = "Occupation must be under 200 characters";
  }

  if (Object.keys(errors).length > 0) {
    return next({ status: 400, message: "Validation failed", errors });
  }
  next();
};

const validateFinancialUpdate = (req, res, next) => {
  const { currency, riskProfile, monthlyIncome } = req.body || {};
  const errors = {};
  const allowedCurrencies = ["INR", "USD", "EUR", "GBP"];
  const allowedRisks = ["Conservative", "Moderate", "Aggressive"];

  if (currency && !allowedCurrencies.includes(currency)) {
    errors.currency = "Invalid currency";
  }
  if (riskProfile && !allowedRisks.includes(riskProfile)) {
    errors.riskProfile = "Invalid risk profile";
  }
  if (monthlyIncome !== undefined) {
    const m = Number(monthlyIncome);
    if (Number.isNaN(m))
      errors.monthlyIncome = "Monthly income must be a number";
    else if (m < 0) errors.monthlyIncome = "Income cannot be negative";
  }

  if (Object.keys(errors).length > 0) {
    return next({ status: 400, message: "Validation failed", errors });
  }
  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return next({
      status: 400,
      message: "Please provide current and new password",
    });
  }
  if (newPassword.length < 8) {
    return next({
      status: 400,
      message: "Password must be at least 8 characters",
    });
  }
  next();
};

module.exports = {
  validateProfileUpdate,
  validateFinancialUpdate,
  validatePasswordChange,
};
