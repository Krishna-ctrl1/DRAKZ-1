const Person = require("../models/people.model");
const bcrypt = require("bcryptjs");

// Get user profile
const getProfile = async (req, res) => {
  try {
    console.log("📊 Fetching profile for user:", req.user.id);
    const startTime = Date.now();

    const user = await Person.findById(req.user.id)
      .select(
        "name email phone occupation role currency riskProfile monthlyIncome",
      )
      .lean();

    console.log(`⚡ Profile fetched in ${Date.now() - startTime}ms`);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      occupation: user.occupation || "",
      role: user.role || "user",
      currency: user.currency || "INR",
      riskProfile: user.riskProfile || "Moderate",
      monthlyIncome: user.monthlyIncome || 0,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update profile information
const updateProfile = async (req, res) => {
  try {
    const { name, phone, occupation } = req.body;

    // Server-side validation
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
        // Check for valid characters
        if (!/^[0-9+\-\s()]+$/.test(phoneRaw)) {
          errors.phone = "Phone number contains invalid characters";
        } else {
          const digits = phoneRaw.replace(/\D/g, "");
          if (digits.length < 10 || digits.length > 15) {
            errors.phone = "Enter a valid phone number (10-15 digits)";
          }
        }
      }
    }

    if (occupation !== undefined && occupation !== null) {
      if (/\d/.test(occupation)) {
        errors.occupation = "Occupation cannot contain numbers";
      } else if (!/^[a-zA-Z\s]+$/.test(occupation)) {
        errors.occupation = "Occupation can only contain letters and spaces";
      }
      if (occupation && occupation.length > 200) {
        errors.occupation = "Occupation must be under 200 characters";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ msg: "Validation failed", errors });
    }

    const updateData = {};
    if (trimmedName) updateData.name = trimmedName;
    if (phone !== undefined) updateData.phone = phone;
    if (occupation !== undefined) updateData.occupation = occupation;

    const user = await Person.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        occupation: user.occupation,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update financial preferences
const updateFinancialPreferences = async (req, res) => {
  try {
    const { currency, riskProfile, monthlyIncome } = req.body;

    // Server-side validation
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
      return res.status(400).json({ msg: "Validation failed", errors });
    }

    const updateData = {};
    if (currency) updateData.currency = currency;
    if (riskProfile) updateData.riskProfile = riskProfile;
    if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;

    const user = await Person.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "Financial preferences updated successfully",
      preferences: {
        currency: user.currency,
        riskProfile: user.riskProfile,
        monthlyIncome: user.monthlyIncome,
      },
    });
  } catch (error) {
    console.error("Error in updateFinancialPreferences:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log("🔐 Password change attempt for user:", req.user.id);

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Please provide current and new password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    const user = await Person.findById(req.user.id);

    if (!user) {
      console.log("❌ User not found:", req.user.id);
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("👤 Found user:", user.email);
    console.log("🔍 Stored hash length:", user.password?.length);
    console.log("🔍 Input password length:", currentPassword?.length);

    // Verify current password
    console.log("⏳ Starting bcrypt compare...");
    const startTime = Date.now();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    const duration = Date.now() - startTime;
    console.log(`⏱️ bcrypt.compare took ${duration}ms`);
    console.log("🔒 Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch for user:", user.email);
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash new password (8 rounds instead of 10 for faster performance)
    console.log("🔐 Hashing new password...");
    const hashStartTime = Date.now();
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`⚡ Password hashed in ${Date.now() - hashStartTime}ms`);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password changed successfully for:", user.email);
    res.json({ msg: "Password changed successfully" });
  } catch (error) {
    console.error("💥 Error in changePassword:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateFinancialPreferences,
  changePassword,
};
