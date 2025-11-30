const Person = require('../models/people.model');
const bcrypt = require('bcryptjs');

// Get user profile
const getProfile = async (req, res) => {
  try {
    console.log('📊 Fetching profile for user:', req.user.id);
    const startTime = Date.now();
    
    const user = await Person.findById(req.user.id)
      .select('name email phone occupation role currency riskProfile monthlyIncome')
      .lean();
    
    console.log(`⚡ Profile fetched in ${Date.now() - startTime}ms`);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      occupation: user.occupation || '',
      role: user.role || 'user',
      currency: user.currency || 'INR',
      riskProfile: user.riskProfile || 'Moderate',
      monthlyIncome: user.monthlyIncome || 0
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update profile information
const updateProfile = async (req, res) => {
  try {
    const { name, phone, occupation } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (occupation !== undefined) updateData.occupation = occupation;

    const user = await Person.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      msg: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        occupation: user.occupation
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update financial preferences
const updateFinancialPreferences = async (req, res) => {
  try {
    const { currency, riskProfile, monthlyIncome } = req.body;

    const updateData = {};
    if (currency) updateData.currency = currency;
    if (riskProfile) updateData.riskProfile = riskProfile;
    if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;

    const user = await Person.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      msg: 'Financial preferences updated successfully',
      preferences: {
        currency: user.currency,
        riskProfile: user.riskProfile,
        monthlyIncome: user.monthlyIncome
      }
    });
  } catch (error) {
    console.error('Error in updateFinancialPreferences:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log('🔐 Password change attempt for user:', req.user.id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    const user = await Person.findById(req.user.id);
    
    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('👤 Found user:', user.email);
    console.log('🔍 Stored hash length:', user.password?.length);
    console.log('🔍 Input password length:', currentPassword?.length);

    // Verify current password
    console.log('⏳ Starting bcrypt compare...');
    const startTime = Date.now();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    const duration = Date.now() - startTime;
    console.log(`⏱️ bcrypt.compare took ${duration}ms`);
    console.log('🔒 Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password mismatch for user:', user.email);
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Hash new password (8 rounds instead of 10 for faster performance)
    console.log('🔐 Hashing new password...');
    const hashStartTime = Date.now();
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`⚡ Password hashed in ${Date.now() - hashStartTime}ms`);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password changed successfully for:', user.email);
    res.json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error('💥 Error in changePassword:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateFinancialPreferences,
  changePassword
};
