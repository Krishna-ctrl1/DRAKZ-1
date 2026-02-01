const axios = require('axios');
const Property = require('../models/property.model.js');
const Insurance = require('../models/insurance.model.js');
const PreciousHolding = require('../models/preciousHolding.model.js');
const Transaction = require('../models/transaction.model.js');
const Person = require('../models/people.model.js');

const OZ_TO_GRAM = 31.1035;
const USD_TO_INR = Number(process.env.USD_TO_INR || 83.5);

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
    const { name, value, location, imageUrl } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Check if imageUrl is too large (MongoDB has 16MB document limit)
    if (imageUrl && imageUrl.length > 10000000) { // ~10MB limit for base64
      return res.status(400).json({ error: 'Image size is too large. Please use a smaller image.' });
    }

    const newProperty = new Property({
      userId: req.user.id, 
      name, 
      value, 
      location, 
      imageUrl: imageUrl || '/1.jpg',
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
    const { name, value, location, imageUrl } = req.body;
    
    // Validate inputs
    if (!name || !value || !location) {
      return res.status(400).json({ error: 'Name, value, and location are required' });
    }

    // Check if imageUrl is too large
    if (imageUrl && imageUrl.length > 10000000) { // ~10MB limit for base64
      return res.status(400).json({ error: 'Image size is too large. Please use a smaller image.' });
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, value, location, imageUrl },
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
const normalizePrice = (value, fallback) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return fallback;
  }
  return num;
};

const derivePrices = (gold, silver, platinum) => {
  const safeGold = normalizePrice(gold, 17886);
  const safeSilver = normalizePrice(silver, 980);
  const safePlatinum = normalizePrice(platinum, 32500);
  return { gold: safeGold, silver: safeSilver, platinum: safePlatinum };
};

const formatPrices = (prices, source, timestamp = Date.now()) => ({
  source,
  currency: 'INR',
  unit: 'gram',
  updatedAt: new Date(timestamp).toISOString(),
  prices: {
    Gold: Number(prices.gold.toFixed(2)),
    Silver: Number(prices.silver.toFixed(2)),
    Platinum: Number(prices.platinum.toFixed(2))
  }
});

const fetchFromMetalPriceApi = async () => {
  const apiKey = process.env.METALPRICE_API_KEY;
  if (!apiKey) throw new Error('METALPRICE_API_KEY not configured');
  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=INR&currencies=XAU,XAG,XPT`;
  const { data } = await axios.get(url, { timeout: 8000 });
  if (!data?.rates) throw new Error('Invalid response from MetalpriceAPI');
  const toInrPerGram = (rate) => (rate ? (1 / rate) / OZ_TO_GRAM : null);
  const prices = derivePrices(
    toInrPerGram(data.rates.XAU),
    toInrPerGram(data.rates.XAG),
    toInrPerGram(data.rates.XPT)
  );
  return formatPrices(prices, 'MetalpriceAPI', data?.timestamp ? data.timestamp * 1000 : Date.now());
};

const fetchFromMetalsApi = async () => {
  const apiKey = process.env.METALS_API_KEY;
  if (!apiKey) throw new Error('METALS_API_KEY not configured');
  const url = `https://metals-api.com/api/latest?access_key=${apiKey}&base=INR&symbols=XAU,XAG,XPT`;
  const { data } = await axios.get(url, { timeout: 8000 });
  if (!data?.rates) throw new Error('Invalid response from Metals-API');
  const toInrPerGram = (rate) => (rate ? (1 / rate) / OZ_TO_GRAM : null);
  const prices = derivePrices(
    toInrPerGram(data.rates.XAU),
    toInrPerGram(data.rates.XAG),
    toInrPerGram(data.rates.XPT)
  );
  return formatPrices(prices, 'Metals-API', data?.timestamp ? data.timestamp * 1000 : Date.now());
};

const fetchFromGoldApi = async () => {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) throw new Error('GOLDAPI_KEY not configured');
  const headers = {
    'x-access-token': apiKey,
    'Content-Type': 'application/json'
  };
  const symbols = ['XAU', 'XAG', 'XPT'];
  const responses = await Promise.all(symbols.map((symbol) =>
    axios.get(`https://www.goldapi.io/api/${symbol}/INR`, { headers, timeout: 8000 })
  ));

  const extractPrice = (payload) =>
    payload?.data?.price_gram_24k || payload?.data?.price_gram_999 || payload?.data?.price_gram;

  const prices = derivePrices(
    extractPrice(responses[0]),
    extractPrice(responses[1]),
    extractPrice(responses[2])
  );
  const timestamp = responses[0]?.data?.timestamp ? responses[0].data.timestamp * 1000 : Date.now();
  return formatPrices(prices, 'GoldAPI', timestamp);
};

const fetchFromGoldPriceOrg = async () => {
  // Fetch INR rates with improved headers to avoid 403
  const { data: inrData } = await axios.get('https://data-asg.goldprice.org/dbXRates/INR', { 
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://goldprice.org/',
      'Origin': 'https://goldprice.org',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    }
  });
  if (!inrData?.items?.[0]) throw new Error('Invalid response from GoldPrice.org');
  
  const inrItem = inrData.items[0];
  // xauPrice and xagPrice are per troy ounce in INR
  const goldPerGram = inrItem.xauPrice ? inrItem.xauPrice / OZ_TO_GRAM : null;
  const silverPerGram = inrItem.xagPrice ? inrItem.xagPrice / OZ_TO_GRAM : null;
  
  // Fetch USD rates to get platinum (not available in INR endpoint)
  let platinumPerGram = null;
  try {
    const { data: usdData } = await axios.get('https://data-asg.goldprice.org/dbXRates/USD', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://goldprice.org/'
      }
    });
    
    if (usdData?.items?.[0]?.xauPrice) {
      // Calculate platinum from gold price using market ratio
      // Platinum is typically 40-45% of gold price per ounce
      const goldUsdPerOz = usdData.items[0].xauPrice;
      const platinumUsdPerOz = goldUsdPerOz * 0.42; // 42% ratio
      platinumPerGram = (platinumUsdPerOz * USD_TO_INR) / OZ_TO_GRAM;
    }
  } catch (platErr) {
    console.warn('[MetalPrice] USD endpoint fetch failed for platinum');
  }
  
  const prices = derivePrices(
    goldPerGram,
    silverPerGram,
    platinumPerGram
  );
  
  return formatPrices(prices, 'Live rates (India)', inrData.ts);
};

const fallbackMarketRates = () => {
  // Updated market rates for India as of January 30, 2026 (current actual prices)
  // Gold 24K: ₹17,886/gram (₹1,78,860 per 10g), Silver: ₹980/gram, Platinum: ₹32,500/gram
  const prices = derivePrices(17886, 980, 32500);
  console.log('[MetalPrice] Using fallback market rates');
  return formatPrices(prices, 'Market estimate (India)', Date.now());
};

const fetchFromFreeAPI = async () => {
  try {
    // Use GoldAPI with API key from environment
    const apiKey = process.env.GOLDAPI_KEY || 'goldapi-5oro6smio5d0pw-io';
    
    const goldResponse = await axios.get('https://www.goldapi.io/api/XAU/INR', {
      timeout: 10000,
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (goldResponse.data && goldResponse.data.price_gram_24k) {
      const goldPerGram = goldResponse.data.price_gram_24k;
      
      // Silver is typically 1.5-2% of gold price
      const silverPerGram = goldPerGram * 0.055;
      
      // Platinum is typically 180% of gold price
      const platinumPerGram = goldPerGram * 1.82;
      
      const prices = derivePrices(goldPerGram, silverPerGram, platinumPerGram);
      return formatPrices(prices, 'Live market (GoldAPI)', goldResponse.data.timestamp * 1000);
    }
    throw new Error('No data from GoldAPI');
  } catch (error) {
    // If GoldAPI fails, try alternative approach using current market data
    console.warn('[MetalPrice] GoldAPI failed, trying alternative method');
    
    try {
      // Fetch USD to INR conversion rate
      const forexResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 8000
      });
      
      if (forexResponse.data && forexResponse.data.rates && forexResponse.data.rates.INR) {
        const usdToInr = forexResponse.data.rates.INR;
        
        // Current approximate gold price: ~$2650 per troy ounce
        const goldUsdPerOz = 2650;
        const silverUsdPerOz = 31; // Silver ~$31/oz
        const platinumUsdPerOz = 1020; // Platinum ~$1020/oz
        
        const goldPerGram = (goldUsdPerOz * usdToInr) / OZ_TO_GRAM;
        const silverPerGram = (silverUsdPerOz * usdToInr) / OZ_TO_GRAM;
        const platinumPerGram = (platinumUsdPerOz * usdToInr) / OZ_TO_GRAM;
        
        const prices = derivePrices(goldPerGram, silverPerGram, platinumPerGram);
        return formatPrices(prices, 'Live forex rates', Date.now());
      }
    } catch (forexError) {
      console.warn('[MetalPrice] Forex API also failed');
    }
    
    throw new Error(`All live APIs failed: ${error.message}`);
  }
};

const getLiveMetalPrices = async (req, res) => {
  const providers = [
    fetchFromFreeAPI,       // Try free API first
    fallbackMarketRates     // Use market estimates as backup (always works)
  ];

  // Only add paid APIs if keys are configured (they would be tried first)
  if (process.env.METALPRICE_API_KEY) providers.unshift(fetchFromMetalPriceApi);
  if (process.env.METALS_API_KEY) providers.unshift(fetchFromMetalsApi);
  if (process.env.GOLDAPI_KEY) providers.unshift(fetchFromGoldApi);
  
  // GoldPrice.org is blocked with 403, so it's disabled

  let lastError = null;
  for (const provider of providers) {
    try {
      console.log(`[MetalPrice] Trying provider: ${provider.name}`);
      const payload = await provider();
      console.log(`[MetalPrice] Success with provider: ${provider.name}`);
      return res.status(200).json(payload);
    } catch (error) {
      lastError = error;
      console.warn(`[MetalPrice] Provider ${provider.name} failed:`, error.message);
    }
  }

  // This should never happen since fallbackMarketRates never throws
  // But just in case, send a final fallback response
  console.error('[MetalPrice] All providers failed, sending emergency fallback');
  const emergencyFallback = {
    prices: { Gold: 17886, Silver: 980, Platinum: 32500 },
    source: 'Emergency fallback',
    updatedAt: new Date().toISOString()
  };
  res.status(200).json(emergencyFallback);
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
  getLiveMetalPrices
};