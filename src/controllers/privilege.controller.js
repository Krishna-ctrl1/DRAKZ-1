const axios = require('axios');
const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');
const Person = require('../models/people.model.js');
const Settings = require('../models/Settings.js');
const Contact = require('../models/ContactModel.js');

const OZ_TO_GRAM = 31.1035;
const USD_TO_INR = Number(process.env.USD_TO_INR || 83.5);

// Server-side cache for metal prices (60-minute expiration)
let metalPricesCache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 60 * 60 * 1000 // 60 minutes in milliseconds
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await Person.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Property
const addProperty = async (req, res) => {
  try {
    const { name, value, location } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Get image path from multer upload
    const imageUrl = req.file ? `/uploads/properties/${req.file.filename}` : '/1.jpg';

    const newProperty = new Property({
      userId: req.user.id, 
      name, 
      value, 
      location, 
      imageUrl,
    });
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) { 
    console.error('Add property error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id });
    res.status(200).json(properties);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteProperty = async (req, res) => {
  try {
    await Property.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ msg: 'Property removed' });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const updateProperty = async (req, res) => {
  try {
    const { name, value, location } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Build update object
    const updateData = { name, value, location };
    
    // If new image uploaded, update imageUrl
    if (req.file) {
      updateData.imageUrl = `/uploads/properties/${req.file.filename}`;
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) { 
    console.error('Update property error:', error);
    res.status(500).json({ error: error.message }); 
  }
};

const getInsurances = async (req, res) => {
  try {
    const insurances = await Insurance.find({ userId: req.user.id });
    res.status(200).json(insurances);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getPreciousHoldings = async (req, res) => {
  try {
    const holdings = await PreciousHolding.find({ userId: req.user.id });
    res.status(200).json(holdings);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const addPreciousHolding = async (req, res) => {
  try {
    const { name, type, amount, purchasedValue, currentValue, purchaseDate } = req.body;
    const newHolding = new PreciousHolding({
      userId: req.user.id, name, type, weight: amount, purchasedValue,
      currentValue: currentValue || purchasedValue, purchaseDate,
    });
    await newHolding.save();
    res.status(201).json(newHolding);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(limit);
    res.status(200).json(transactions);
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// Delete Precious Holding
const deletePreciousHolding = async (req, res) => {
  try {
    const holding = await PreciousHolding.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    res.status(200).json({ msg: 'Holding removed successfully' });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

// --- Seed Insurances and Transactions with Random Data ---
const seedData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete existing insurances and transactions
    await Insurance.deleteMany({ userId });
    await Transaction.deleteMany({ userId });

    // Create 2-4 Random Insurances
    const providers = ['Geico', 'BlueCross', 'StateFarm', 'Allstate', 'Progressive', 'Aetna'];
    const types = ['Auto', 'Health', 'Life', 'Home'];
    const insuranceCount = Math.floor(Math.random() * 3) + 2; // 2-4 insurances
    
    const randomInsurances = [];
    for(let i = 0; i < insuranceCount; i++) {
      const type = types[i % types.length]; // Cycle through types
      randomInsurances.push({
        userId,
        provider: providers[Math.floor(Math.random() * providers.length)],
        type: type,
        coverageAmount: Math.floor(Math.random() * 500000) + 50000, // $50k - $550k
        premium: Math.floor(Math.random() * 500) + 100, // $100 - $600
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date in last year
      });
    }

    const insurances = await Insurance.create(randomInsurances);

    // Create 8-12 Random Transactions (1 Pending, more Active, some Completed)
    const statuses = ['Pending', 'Active', 'Active', 'Active', 'Active', 'Active', 'Completed', 'Completed'];
    const transactionCount = Math.floor(Math.random() * 5) + 8; // 8-12 transactions
    
    const randomTransactions = [];
    for(let i = 0; i < transactionCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
      
      randomTransactions.push({
        userId,
        type: type,
        amount: Math.floor(Math.random() * 800) + 200, // $200 - $1000
        status: status,
        description: `${type} Insurance Premium`,
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    const transactions = await Transaction.create(randomTransactions);

    // Count by status
    const pendingCount = transactions.filter(t => t.status === 'Pending').length;
    const activeCount = transactions.filter(t => t.status === 'Active').length;
    const completedCount = transactions.filter(t => t.status === 'Completed').length;

    res.status(200).json({ 
      msg: "Data generated successfully!", 
      insurances,
      transactions: {
        total: transactions.length,
        pending: pendingCount,
        active: activeCount,
        completed: completedCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Update Transaction Status
const updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create New Transaction
const createTransaction = async (req, res) => {
  try {
    const { type, amount, status, description, date } = req.body;
    
    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      status: status || 'Pending',
      description: description || `${type} Insurance Premium`,
      date: date || new Date()
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Live Metal Prices ------------------------------------------------------
const getLiveMetalPrices = async (req, res) => {
  try {
    // Check if cache is valid (60-minute expiration)
    const now = Date.now();
    if (metalPricesCache.data && metalPricesCache.timestamp && 
        (now - metalPricesCache.timestamp) < metalPricesCache.CACHE_DURATION) {
      console.log('[MetalPrice] Returning cached data');
      return res.json(metalPricesCache.data);
    }

    // Fallback rates (Feb 2026 India Market)
    const fallbackRates = {
      Gold: 15442,
      Silver: 254,
      Platinum: 6540
    };

    const GOLDAPI_KEY = 'goldapi-5oro6smio5d0pw-io';
    const BASE_URL = 'https://www.goldapi.io/api';
    
    const metals = {
      Gold: 'XAU',
      Silver: 'XAG',
      Platinum: 'XPT'
    };

    const prices = {};
    let apiSuccess = true;
    let fetchedCount = 0;

    // Fetch prices for each metal from GoldAPI.io
    for (const [metalName, metalSymbol] of Object.entries(metals)) {
      try {
        console.log(`[MetalPrice] Fetching ${metalName} (${metalSymbol}) from GoldAPI.io...`);
        const response = await axios.get(`${BASE_URL}/${metalSymbol}/INR`, {
          headers: {
            'x-access-token': GOLDAPI_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        if (response.data && response.data.price_gram_24k) {
          prices[metalName] = Math.round(response.data.price_gram_24k * 100) / 100;
          fetchedCount++;
          console.log(`[MetalPrice] ${metalName}: ₹${prices[metalName]}/gram from GoldAPI.io`);
        } else {
          console.warn(`[MetalPrice] ${metalName}: No price_gram_24k in response, using fallback`);
          prices[metalName] = fallbackRates[metalName];
          apiSuccess = false;
        }
      } catch (error) {
        console.error(`[MetalPrice] Error fetching ${metalName}:`, error.message);
        prices[metalName] = fallbackRates[metalName];
        apiSuccess = false;
      }
    }

    // If no prices were fetched successfully, mark as complete failure
    if (fetchedCount === 0) {
      apiSuccess = false;
      console.warn('[MetalPrice] All API calls failed, using complete fallback rates');
      Object.assign(prices, fallbackRates);
    }

    const responseData = {
      source: apiSuccess ? 'GoldAPI.io (Live)' : 'Fallback Rates',
      currency: 'INR',
      unit: 'gram',
      prices: {
        Gold: prices.Gold || fallbackRates.Gold,
        Silver: prices.Silver || fallbackRates.Silver,
        Platinum: prices.Platinum || fallbackRates.Platinum
      }
    };

    // Update cache
    metalPricesCache.data = responseData;
    metalPricesCache.timestamp = now;
    console.log(`[MetalPrice] Cache updated. Next refresh at: ${new Date(now + metalPricesCache.CACHE_DURATION).toLocaleTimeString()}`);

    res.json(responseData);
  } catch (error) {
    console.error('[MetalPrice] Critical error in getLiveMetalPrices:', error);
    
    // Return fallback rates on complete failure
    const fallbackResponse = {
      source: 'Fallback Rates',
      currency: 'INR',
      unit: 'gram',
      prices: {
        Gold: 15442,
        Silver: 254,
        Platinum: 6540
      }
    };

    res.json(fallbackResponse);
  }
};

// --- ADMIN DASHBOARD FUNCTIONS ---

// 1. Get Analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await Person.countDocuments({ role: 'user' });
    const totalAdvisors = await Person.countDocuments({ role: 'advisor' });
    const activeUsers = await Person.countDocuments({ role: 'user', status: 'Active' });
    const suspendedUsers = await Person.countDocuments({ role: 'user', status: 'Suspended' });
    const activeAdvisors = await Person.countDocuments({ role: 'advisor', status: 'Active', isApproved: true });
    const pendingAdvisors = await Person.countDocuments({ role: 'advisor', isApproved: false, isRejected: false });

    res.status(200).json({
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers },
        advisors: { total: totalAdvisors, active: activeAdvisors, pending: pendingAdvisors }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Get All Users (with filters)
const getAllUsers = async (req, res) => {
  try {
    const { role, status, isApproved } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    // Exclude password
    const users = await Person.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Toggle User Status (Suspend/Activate)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Person.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    await user.save();
    
    res.status(200).json({ msg: `User ${user.status}`, status: user.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Approve Advisor
const approveAdvisor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Person.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'advisor') return res.status(400).json({ error: 'User is not an advisor' });

    user.isApproved = true;
    user.isRejected = false;
    await user.save();

    res.status(200).json({ msg: 'Advisor approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Reject Advisor
const rejectAdvisor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Person.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.isApproved = false;
    user.isRejected = true;
    await user.save();

    res.status(200).json({ msg: 'Advisor rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Assign Advisor to User
const assignAdvisor = async (req, res) => {
  try {
    const { userId, advisorId } = req.body;
    
    const user = await Person.findById(userId);
    const advisor = await Person.findById(advisorId);

    if (!user || !advisor) return res.status(404).json({ error: 'User or Advisor not found' });
    if (advisor.role !== 'advisor') return res.status(400).json({ error: 'Selected person is not an advisor' });
    if (!advisor.isApproved) return res.status(400).json({ error: 'Advisor is not approved yet' });

    user.assignedAdvisor = advisorId;
    await user.save();

    res.status(200).json({ msg: 'Advisor assigned successfully', assignedAdvisor: advisor.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Business Analytics (Transactions, Growth, Top Advisors)
const getBusinessAnalytics = async (req, res) => {
  try {
    // 1. Financials: Total Transaction Volume
    const transactions = await Transaction.find({ status: 'Completed' });
    const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. User Growth (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const userGrowth = await Person.aggregate([
      { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Top Advisors by Client Count (Assuming assignment logic exists or placeholders)
    // For now, let's just return advisors sorted by experience as a proxy or random
    const topAdvisors = await Person.find({ role: 'advisor', isApproved: true })
      .sort({ "advisorProfile.experience": -1 })
      .limit(5)
      .select('name advisorProfile.specialization advisorProfile.experience');

    res.status(200).json({
      totalVolume,
      userGrowth,
      topAdvisors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Support Tickets
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 9. Get Global Settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne(); // Use the model directly, not static method if not defined there yet or just standard mongoose
    if (!settings) {
      const newSettings = new Settings();
      await newSettings.save();
      return res.status(200).json(newSettings);
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 10. Update Global Settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const { maintenanceMode, allowRegistrations, commissionRate, supportEmail } = req.body;
    
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (allowRegistrations !== undefined) settings.allowRegistrations = allowRegistrations;
    if (commissionRate !== undefined) settings.commissionRate = commissionRate;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    
    settings.updatedBy = req.user.id;
    await settings.save();
    
    res.status(200).json({ msg: "Settings updated", settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserProfile,
  addProperty, 
  getProperties, 
  deleteProperty,
  updateProperty,
  getInsurances, 
  getPreciousHoldings, 
  addPreciousHolding,
  deletePreciousHolding,
  getTransactions,
  updateTransaction,
  createTransaction,
  seedData,
  getLiveMetalPrices,
  // New Admin Functions
  getAnalytics,
  getAllUsers,
  toggleUserStatus,
  approveAdvisor,
  rejectAdvisor,
  assignAdvisor,
  getBusinessAnalytics,
  getSupportTickets,
  getSettings,
  updateSettings
};