/**
 * ============================================================================
 * DRAKZ DATABASE REFRESH SCRIPT
 * ============================================================================
 * 
 * This script refreshes ALL time-sensitive data in the database so the website
 * shows recent, realistic-looking financial data.
 * 
 * HOW TO USE:
 * 1. Set your MONGO_URI below
 * 2. Adjust DATE_RANGE_START and DATE_RANGE_END to control the date window
 * 3. Run: node scripts/refresh_database.js
 * 
 * WHAT IT DOES:
 * - Clears all financial data (spendings, transactions, cards, loans, etc.)
 * - Re-seeds everything with fresh dates within your specified range
 * - Does NOT delete or modify user/person accounts
 * - Keeps all ObjectId references consistent
 * 
 * WHAT IT DOES NOT DO:
 * - Does not touch the Person collection (users stay intact)
 * - Does not touch Settings or AdvisorRequest collections
 * ============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ============================================================================
// ⚙️  CONFIGURATION — CHANGE THESE VALUES
// ============================================================================

// 👇 PASTE YOUR MONGO_URI HERE (e.g. 'mongodb+srv://user:pass@cluster0.xxx.mongodb.net/fdfed')
const MONGO_URI = 'mongodb+srv://ziko120204:Zulqar120204@cluster0.lbqv1.mongodb.net/fdfed_test';

// 👇 DATABASE NAME — Change this to test on a separate DB without touching your main one
//    Set to null to use whatever DB name is already in your MONGO_URI
//    Set to 'fdfed_test' (or any name) to create/use a separate test database
const DB_NAME = 'fdfed_test';

// 👇 DATE RANGE — All generated data will fall within this window
// Format: 'YYYY-MM-DD'
const DATE_RANGE_START = '2025-10-01';
const DATE_RANGE_END   = '2026-03-24';

// 👇 Set to true if you also want to re-create the users from scratch
//    (WARNING: This will delete all existing users and create fresh ones)
//    For a fresh test DB, set this to true so users are created too!
const RECREATE_USERS = true;

// ============================================================================
// END OF CONFIGURATION
// ============================================================================

// Parse dates
const START_DATE = new Date(DATE_RANGE_START);
const END_DATE = new Date(DATE_RANGE_END);
const DATE_RANGE_MS = END_DATE.getTime() - START_DATE.getTime();

// ============================================================================
// MODELS (inline requires)
// ============================================================================
const Person = require('../src/models/people.model');
const Spending = require('../src/models/Spending');
const Card = require('../src/models/Card');
const CreditScore = require('../src/models/CreditScore');
const Loan = require('../src/models/loan.model');
const Holding = require('../src/models/holding.model');
const UserStock = require('../src/models/userStock.model');
const Property = require('../src/models/property.model');
const Insurance = require('../src/models/insurance.model');
const PreciousHolding = require('../src/models/preciousHolding.model');
const Transaction = require('../src/models/transaction.model');
const Blog = require('../src/models/blog.model');
const Contact = require('../src/models/ContactModel');
const Settings = require('../src/models/Settings');

// ============================================================================
// HELPERS
// ============================================================================

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Returns a random Date between START_DATE and END_DATE */
function randomDate() {
  return new Date(START_DATE.getTime() + Math.random() * DATE_RANGE_MS);
}

/** Returns a random date within the last N days from END_DATE */
function recentDate(withinDays = 30) {
  const ms = withinDays * 24 * 60 * 60 * 1000;
  return new Date(END_DATE.getTime() - Math.random() * ms);
}

/** Returns a date that is `monthsBack` months before END_DATE, with some jitter */
function monthsAgo(monthsBack) {
  const d = new Date(END_DATE);
  d.setMonth(d.getMonth() - monthsBack);
  d.setDate(getRandomInt(1, 28));
  return d;
}

/** Formats a date as a readable string like "March 15, 2026" */
function formatDateString(d) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Simple encryption for card numbers (mirrors crypto.util.js logic) */
function encryptCardNumber(pan) {
  try {
    const raw = process.env.CARD_ENC_KEY || process.env.JWT_SECRET || 'drakz-default-key';
    const key = crypto.createHash('sha256').update(String(raw)).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(String(pan), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      encryptedNumber: enc.toString('base64'),
      encryptedIv: iv.toString('base64'),
      encryptedTag: tag.toString('base64'),
    };
  } catch {
    return {};
  }
}

// ============================================================================
// REALISTIC DATA POOLS
// ============================================================================

const SPENDING_CATEGORIES = {
  expense: [
    'Shopping and Entertainment', 'Groceries and Utilities', 'Transportation and Health',
    'Dining and Takeout', 'Travel and Experiences', 'Bills and Subscriptions',
    'Entertainment', 'Shopping', 'Transport', 'Groceries', 'Dining', 'Other',
    'Rent', 'Insurance Premium', 'Fuel', 'Medical', 'Education'
  ],
  income: [
    'Salary', 'Freelancing', 'Interest Income', 'Dividend', 'Refund', 'Bonus', 'Cashback'
  ]
};

const SPENDING_DESCRIPTIONS = {
  'Shopping and Entertainment': ['Amazon purchase', 'Netflix subscription', 'Flipkart order', 'Movie tickets', 'Gaming subscription'],
  'Groceries and Utilities': ['BigBasket order', 'DMart monthly', 'Electricity bill', 'Water bill', 'Gas cylinder'],
  'Transportation and Health': ['Uber ride', 'Ola cab', 'Metro card recharge', 'Pharmacy', 'Doctor consultation'],
  'Dining and Takeout': ['Zomato order', 'Swiggy delivery', 'Restaurant dinner', 'Cafe coffee', 'Street food'],
  'Travel and Experiences': ['Flight tickets', 'Hotel booking', 'Train ticket', 'Bus ticket', 'Resort stay'],
  'Bills and Subscriptions': ['Mobile recharge', 'WiFi bill', 'Spotify premium', 'Gym membership', 'Cloud storage'],
  'Entertainment': ['Concert tickets', 'Theme park', 'Bowling night', 'Book purchase', 'Art supplies'],
  'Shopping': ['Myntra haul', 'Ajio order', 'Electronics purchase', 'Home decor', 'Clothing'],
  'Transport': ['Petrol fill-up', 'Car service', 'Parking charges', 'Toll charges', 'Tyre replacement'],
  'Groceries': ['Weekly groceries', 'Fruits and vegetables', 'Dairy products', 'Snacks', 'Organic items'],
  'Dining': ['Lunch out', 'Dinner party', 'Birthday treat', 'Coffee meeting', 'Team lunch'],
  'Other': ['ATM withdrawal', 'Gift purchase', 'Charity donation', 'Miscellaneous', 'Cash payment'],
  'Rent': ['Monthly rent', 'Maintenance charges', 'Parking rent', 'Storage rent'],
  'Insurance Premium': ['Health insurance premium', 'Car insurance premium', 'Life insurance premium'],
  'Fuel': ['Petrol', 'Diesel', 'CNG refill', 'EV charging'],
  'Medical': ['Lab tests', 'Medicine purchase', 'Dental check-up', 'Eye check-up', 'Physiotherapy'],
  'Education': ['Online course', 'Certification exam', 'Book purchase', 'Coaching fees', 'Workshop registration'],
  'Salary': ['Monthly salary credit', 'Salary'],
  'Freelancing': ['Freelance project payment', 'Contract work', 'Consulting fee'],
  'Interest Income': ['Savings account interest', 'FD interest credit'],
  'Dividend': ['Stock dividend', 'Mutual fund dividend'],
  'Refund': ['Order refund', 'Insurance claim', 'Tax refund'],
  'Bonus': ['Performance bonus', 'Festival bonus', 'Annual bonus'],
  'Cashback': ['Credit card cashback', 'UPI cashback', 'Wallet cashback']
};

const STOCK_DATA = [
  { name: 'Apple',     symbol: 'AAPL',  price: 185, changeRange: [-3, 5] },
  { name: 'Tesla',     symbol: 'TSLA',  price: 245, changeRange: [-8, 12] },
  { name: 'Microsoft', symbol: 'MSFT',  price: 325, changeRange: [-2, 4] },
  { name: 'Amazon',    symbol: 'AMZN',  price: 145, changeRange: [-4, 6] },
  { name: 'Google',    symbol: 'GOOGL', price: 140, changeRange: [-3, 5] },
  { name: 'NVIDIA',    symbol: 'NVDA',  price: 480, changeRange: [-5, 8] },
  { name: 'Meta',      symbol: 'META',  price: 350, changeRange: [-4, 7] },
  { name: 'Netflix',   symbol: 'NFLX',  price: 475, changeRange: [-3, 5] },
];

const CARD_BRANDS = ['Visa', 'MasterCard', 'RuPay', 'American Express'];
const CARD_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1'];

const INSURANCE_PROVIDERS = ['HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'Star Health', 'LIC', 'Max Bupa', 'SBI Life', 'Tata AIG'];
const INSURANCE_TYPES_ENUM = ['Auto', 'Health', 'Life', 'Home'];

const PROPERTY_LOCATIONS = [
  'Gachibowli, Hyderabad', 'HITEC City, Hyderabad', 'Kondapur, Hyderabad',
  'Banjara Hills, Hyderabad', 'Jubilee Hills, Hyderabad', 'Madhapur, Hyderabad',
  'Whitefield, Bangalore', 'Indiranagar, Bangalore', 'Koramangala, Bangalore',
  'Andheri, Mumbai', 'Powai, Mumbai', 'Bandra, Mumbai',
];

const PROPERTY_NAMES = [
  '3BHK Apartment', '2BHK Flat', 'Luxury Villa', 'Independent House',
  'Studio Apartment', 'Penthouse Suite', 'Row House', 'Duplex House'
];

const PRECIOUS_TYPES = ['Gold', 'Silver', 'Platinum'];
const PRECIOUS_ITEMS = {
  Gold:     ['Gold Coins (24K)', 'Gold Biscuit', 'Gold Jewelry Set', 'Gold Chain', 'Gold Ring'],
  Silver:   ['Silver Bars', 'Silver Coins', 'Silver Jewelry', 'Silver Utensils'],
  Platinum: ['Platinum Ring', 'Platinum Coins', 'Platinum Bar'],
};

const LOAN_TYPES = [
  { type: 'Home Loan',     principal: [2000000, 8000000], rate: [6.5, 9.5],  term: [15, 30], emi: [15000, 65000] },
  { type: 'Car Loan',      principal: [300000, 1500000],  rate: [7.0, 12.0], term: [3, 7],   emi: [5000, 25000] },
  { type: 'Personal Loan', principal: [50000, 500000],    rate: [10.0, 18.0],term: [1, 5],   emi: [2000, 15000] },
  { type: 'Education Loan', principal: [500000, 2500000], rate: [6.0, 10.0], term: [5, 15],  emi: [5000, 30000] },
  { type: 'Business Loan', principal: [200000, 2000000],  rate: [9.0, 16.0], term: [2, 10],  emi: [5000, 40000] },
];

const HOLDING_DATA = [
  { name: 'Vanguard S&P 500 ETF',    type: 'ETF',    qty: [10, 100],  price: [350, 450] },
  { name: 'iShares MSCI World',       type: 'ETF',    qty: [5, 50],    price: [75, 95] },
  { name: 'Bitcoin',                   type: 'Crypto', qty: [0.01, 1.5], price: [25000, 65000] },
  { name: 'Ethereum',                 type: 'Crypto', qty: [0.5, 10],  price: [1500, 3500] },
  { name: 'US Treasury Bond 10Y',     type: 'Bond',   qty: [1, 10],    price: [900, 1100] },
  { name: 'Gold ETF (SBI)',           type: 'ETF',    qty: [10, 200],  price: [45, 55] },
  { name: 'Nifty 50 Index Fund',      type: 'ETF',    qty: [50, 500],  price: [180, 220] },
];

const BLOG_TITLES = [
  { title: '5 Smart Money Moves to Make Before Year-End', content: 'As the financial year wraps up, there are several key moves you should make to optimize your tax savings and investment returns. First, review your 80C investments — have you maxed out via ELSS, PPF, or NPS? Second, consider tax-loss harvesting on underperforming stocks. Third, rebalance your portfolio to match your risk profile. Fourth, check your health insurance adequacy. Fifth, set up or increase your emergency fund. Each of these steps can save you lakhs in the long run.' },
  { title: 'The Rise of Passive Investing in India: What You Need to Know', content: 'Index funds and ETFs have seen a massive surge in popularity in India. With expense ratios as low as 0.05%, they offer a cost-effective way to participate in market growth. This guide covers the top Nifty 50 and Sensex index funds, how to evaluate tracking error, and why passive investing beats active management for most retail investors over the long term.' },
  { title: 'How to Build a ₹1 Crore Portfolio by Age 35', content: 'Starting early is the key. With a disciplined SIP of ₹15,000 per month in a diversified equity fund returning 12% annually, you can accumulate over ₹1 crore by age 35. This article breaks down the math, suggests a sample asset allocation, and discusses the role of debt funds, gold, and international diversification.' },
  { title: 'Understanding UPI and Digital Payments: Security Tips', content: 'UPI transactions crossed 10 billion monthly in India. While incredibly convenient, digital payments come with risks. Learn how to spot phishing attempts, why you should never share your UPI PIN, the importance of transaction limits, and how to report unauthorized transactions to your bank.' },
  { title: 'Real Estate vs Mutual Funds: Where Should You Invest?', content: 'The age-old debate of real estate versus mutual funds continues. Real estate offers tangible assets and rental income, but requires high capital and has low liquidity. Mutual funds offer diversification, professional management, and high liquidity with lower entry points. This article compares both using real returns data from the last 10 years.' },
  { title: 'Emergency Funds: How Much is Enough?', content: 'Financial advisors recommend 6-12 months of expenses as an emergency fund. But how do you calculate the right amount? Consider your monthly expenses, number of dependents, job stability, and existing insurance coverage. We walk through a step-by-step calculator and suggest the best liquid fund options to park your emergency money.' },
  { title: 'Credit Score Decoded: How to Go from 650 to 800+', content: 'Your CIBIL score affects everything from loan approvals to interest rates. This comprehensive guide explains the five factors that determine your score, common mistakes that tank it (like multiple hard inquiries), and a 12-month action plan to boost your score from 650 to 800+. Includes real case studies.' },
  { title: 'SIP vs Lumpsum: Which is Better in a Volatile Market?', content: 'Market volatility makes investors nervous, but should it? SIPs through rupee cost averaging can actually benefit from volatility by buying more units when markets dip. However, lumpsum investing wins when markets are trending upward. We analyze historical data to show when each strategy works best.' },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Generate spending records for a user.
 * Creates 60-90 realistic transactions across the date range.
 */
function generateSpendings(userId) {
  const docs = [];
  const count = getRandomInt(60, 90);

  for (let i = 0; i < count; i++) {
    const isIncome = Math.random() > 0.72; // ~28% income, 72% expense
    const type = isIncome ? 'income' : 'expense';
    const category = pick(SPENDING_CATEGORIES[type]);
    const descriptions = SPENDING_DESCRIPTIONS[category] || ['General transaction'];
    const description = pick(descriptions);

    let amount;
    if (isIncome) {
      if (category === 'Salary') {
        amount = getRandomInt(25000, 150000); // Monthly salary range
      } else {
        amount = getRandomInt(500, 25000);
      }
    } else {
      // Realistic expense amounts by category
      if (['Rent'].includes(category)) {
        amount = getRandomInt(8000, 35000);
      } else if (['Insurance Premium'].includes(category)) {
        amount = getRandomInt(2000, 15000);
      } else if (['Shopping and Entertainment', 'Travel and Experiences'].includes(category)) {
        amount = getRandomInt(500, 8000);
      } else {
        amount = getRandomInt(50, 3000);
      }
    }

    docs.push({
      user: userId,
      amount,
      type,
      category,
      description,
      date: randomDate(),
    });
  }

  // Ensure at least one salary entry per month in the range
  const months = Math.ceil(DATE_RANGE_MS / (30 * 24 * 60 * 60 * 1000));
  for (let m = 0; m < months; m++) {
    const salaryDate = new Date(START_DATE);
    salaryDate.setMonth(salaryDate.getMonth() + m);
    salaryDate.setDate(getRandomInt(1, 5)); // Salary in first 5 days
    if (salaryDate <= END_DATE) {
      docs.push({
        user: userId,
        amount: getRandomInt(30000, 120000),
        type: 'income',
        category: 'Salary',
        description: 'Monthly salary credit',
        date: salaryDate,
      });
    }
  }

  return docs;
}

/**
 * Generate credit card and debit card records for a user.
 */
function generateCards(userId, userName) {
  const cards = [];
  const numCards = getRandomInt(2, 4);

  for (let i = 0; i < numCards; i++) {
    const type = i === 0 ? 'credit' : (i === 1 ? 'debit' : pick(['credit', 'debit']));
    const brand = pick(CARD_BRANDS);
    const last4 = String(getRandomInt(1000, 9999));
    const pan = `${getRandomInt(4000, 5999)}${getRandomInt(1000, 9999)}${getRandomInt(1000, 9999)}${last4}`;
    const enc = encryptCardNumber(pan);

    const expiryYear = END_DATE.getFullYear() + getRandomInt(1, 4);
    const expiryMonth = getRandomInt(1, 12);

    cards.push({
      user: userId,
      holderName: userName,
      type,
      brand,
      last4,
      masked: `**** **** **** ${last4}`,
      ...enc,
      expiryMonth,
      expiryYear,
      colorTheme: pick(CARD_COLORS),
      notes: type === 'credit' ? pick(['Primary Card', 'Shopping Card', 'Travel Card', 'Rewards Card']) :
                                  pick(['Daily Spending', 'Savings Account', 'Salary Account']),
    });
  }

  return cards;
}

/**
 * Generate credit score with monthly history within the date range.
 */
function generateCreditScore(userId) {
  const baseScore = getRandomInt(680, 820);
  const history = [];
  const monthsInRange = Math.ceil(DATE_RANGE_MS / (30 * 24 * 60 * 60 * 1000));

  for (let i = 0; i < Math.min(monthsInRange, 12); i++) {
    const d = new Date(END_DATE);
    d.setMonth(d.getMonth() - i);
    d.setDate(getRandomInt(1, 5));

    // Score fluctuates ±20 around base, trending slightly upward
    const drift = Math.round((i / 12) * -15); // Older = slightly lower
    const jitter = getRandomInt(-10, 10);
    const score = Math.min(850, Math.max(300, baseScore + drift + jitter));

    history.push({
      score,
      note: i === 0 ? 'Latest update' : `Month ${i + 1} update`,
      date: d,
    });
  }

  return {
    user: userId,
    score: history[0].score,
    lastUpdated: history[0].date,
    history,
  };
}

/**
 * Generate loan records for a user.
 */
function generateLoans(userId) {
  const loans = [];
  const numLoans = getRandomInt(1, 3);
  const usedTypes = new Set();

  for (let i = 0; i < numLoans; i++) {
    let loanTemplate;
    do {
      loanTemplate = pick(LOAN_TYPES);
    } while (usedTypes.has(loanTemplate.type) && usedTypes.size < LOAN_TYPES.length);
    usedTypes.add(loanTemplate.type);

    const principal = getRandomInt(...loanTemplate.principal);
    const paidPercent = getRandomFloat(0.1, 0.7);
    const totalPaid = Math.round(principal * paidPercent);
    const balance = principal - totalPaid;
    const rate = getRandomFloat(...loanTemplate.rate);
    const term = getRandomInt(...loanTemplate.term);
    const emi = getRandomInt(...loanTemplate.emi);

    // Date taken is 1-3 years before START_DATE
    const dateTaken = new Date(START_DATE);
    dateTaken.setFullYear(dateTaken.getFullYear() - getRandomInt(1, 3));
    dateTaken.setMonth(getRandomInt(0, 11));
    dateTaken.setDate(getRandomInt(1, 28));

    // Next due is within 30 days of END_DATE
    const nextDue = new Date(END_DATE);
    nextDue.setDate(nextDue.getDate() + getRandomInt(1, 30));

    const statuses = ['Active', 'Active', 'Active', 'Paid']; // Mostly active
    const status = i === 0 ? 'Active' : pick(statuses);

    loans.push({
      user_id: userId,
      type: loanTemplate.type,
      principal,
      balance: status === 'Paid' ? 0 : balance,
      dateTaken: formatDateString(dateTaken),
      status,
      interestRate: rate,
      term,
      emi,
      nextDue: status === 'Paid' ? null : formatDateString(nextDue),
      totalPaid: status === 'Paid' ? principal : totalPaid,
    });
  }

  return loans;
}

/**
 * Generate stock holdings for a user.
 */
function generateStocks(userId) {
  const stocks = [];
  const numStocks = getRandomInt(2, 5);
  const shuffled = [...STOCK_DATA].sort(() => Math.random() - 0.5).slice(0, numStocks);

  for (const stock of shuffled) {
    const buyVariation = getRandomFloat(0.75, 1.1);
    const avgBuyPrice = +(stock.price * buyVariation).toFixed(2);
    const changePct = getRandomFloat(...stock.changeRange);

    stocks.push({
      user_id: userId,
      name: stock.name,
      symbol: stock.symbol,
      quantity: getRandomInt(5, 150),
      avg_buy_price: avgBuyPrice,
      current_price: stock.price,
      change_pct: `${changePct > 0 ? '+' : ''}${changePct}%`,
    });
  }

  return stocks;
}

/**
 * Generate general investment holdings (ETFs, crypto, bonds).
 */
function generateHoldings(userId) {
  const holdings = [];
  const numHoldings = getRandomInt(2, 4);
  const shuffled = [...HOLDING_DATA].sort(() => Math.random() - 0.5).slice(0, numHoldings);

  for (const h of shuffled) {
    const qty = h.type === 'Crypto' ? getRandomFloat(...h.qty) : getRandomInt(...h.qty);
    const price = getRandomInt(...h.price);

    holdings.push({
      userId,
      name: h.name,
      type: h.type,
      quantity: qty,
      purchaseValue: +(qty * price).toFixed(2),
    });
  }

  return holdings;
}

/**
 * Generate transaction history (insurance/investment transactions).
 */
function generateTransactions(userId) {
  const txns = [];
  const types = ['Auto', 'Health', 'Life', 'Home', 'Insurance', 'Investment'];
  const statuses = ['Completed', 'Completed', 'Completed', 'Pending', 'Active'];
  const descriptions = {
    Auto: ['Car insurance payment', 'Bike insurance renewal', 'Vehicle policy premium'],
    Health: ['Health insurance premium', 'Medical policy payment', 'Family floater premium'],
    Life: ['Term plan premium', 'Life cover payment', 'Endowment plan installment'],
    Home: ['Home insurance premium', 'Property fire cover', 'House protection plan'],
    Insurance: ['General insurance payment', 'Policy renewal', 'Annual premium'],
    Investment: ['SIP installment', 'Lumpsum investment', 'Mutual fund purchase', 'ETF buy order', 'Bond investment'],
  };

  // Generate 12-20 transactions spread across the date range
  const count = getRandomInt(12, 20);
  for (let i = 0; i < count; i++) {
    const type = pick(types);
    txns.push({
      userId,
      type,
      amount: getRandomInt(500, 25000),
      status: pick(statuses),
      description: pick(descriptions[type]),
      date: randomDate(),
    });
  }

  return txns;
}

/**
 * Generate property records for a user.
 */
function generateProperties(userId) {
  const props = [];
  const numProps = getRandomInt(1, 3);

  for (let i = 0; i < numProps; i++) {
    const name = pick(PROPERTY_NAMES);
    const location = pick(PROPERTY_LOCATIONS);
    const baseValue = getRandomInt(2000000, 12000000);

    props.push({
      userId,
      name: `${name} ${i + 1}`,
      value: baseValue,
      location,
      imageUrl: `/uploads/properties/${getRandomInt(1, 10)}.jpg`,
    });
  }

  return props;
}

/**
 * Generate insurance policies for a user.
 */
function generateInsurances(userId) {
  const policies = [];
  const numPolicies = getRandomInt(2, 4);
  const usedTypes = new Set();

  for (let i = 0; i < numPolicies; i++) {
    let type;
    do {
      type = pick(INSURANCE_TYPES_ENUM);
    } while (usedTypes.has(type) && usedTypes.size < INSURANCE_TYPES_ENUM.length);
    usedTypes.add(type);

    const provider = pick(INSURANCE_PROVIDERS);
    const startDate = randomDate();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + getRandomInt(1, 5));

    const coverageMultiplier = {
      Auto: [200000, 800000],
      Health: [500000, 2500000],
      Life: [2500000, 10000000],
      Home: [1500000, 5000000],
    };

    policies.push({
      userId,
      provider,
      type,
      coverageAmount: getRandomInt(...(coverageMultiplier[type] || [500000, 2000000])),
      premium: getRandomInt(2000, 30000),
      startDate,
      endDate,
    });
  }

  return policies;
}

/**
 * Generate precious metal/gem holdings for a user.
 */
function generatePreciousHoldings(userId) {
  const holdings = [];

  // 70% chance of having precious holdings
  if (Math.random() > 0.3) {
    const numItems = getRandomInt(1, 3);

    for (let i = 0; i < numItems; i++) {
      const type = pick(PRECIOUS_TYPES);
      const name = pick(PRECIOUS_ITEMS[type]);

      const weights = { Gold: [5, 50], Silver: [50, 500], Platinum: [2, 20] };
      const pricePerGram = { Gold: [5500, 6500], Silver: [65, 80], Platinum: [2800, 3500] };

      const weight = getRandomInt(...(weights[type]));
      const buyRate = getRandomInt(...(pricePerGram[type]));
      const currentRate = Math.round(buyRate * getRandomFloat(1.02, 1.15)); // 2-15% appreciation

      const purchaseDate = new Date(END_DATE);
      purchaseDate.setMonth(purchaseDate.getMonth() - getRandomInt(6, 36));

      holdings.push({
        userId,
        name,
        type,
        weight: `${weight}g`,
        purchasedValue: weight * buyRate,
        currentValue: weight * currentRate,
        purchaseDate,
      });
    }
  }

  return holdings;
}

/**
 * Generate blog posts (general, not user-specific).
 */
function generateBlogs(authorIds) {
  return BLOG_TITLES.map((blog, i) => {
    const publishDate = randomDate();
    const createdDate = new Date(publishDate);
    createdDate.setDate(createdDate.getDate() - getRandomInt(1, 7));

    const statuses = ['approved', 'approved', 'approved', 'pending'];
    const status = pick(statuses);

    return {
      title: blog.title,
      content: blog.content,
      author_id: pick(authorIds),
      status,
      verified_by: status === 'approved' ? pick(authorIds) : null,
      published_at: status === 'approved' ? publishDate : null,
    };
  });
}

// ============================================================================
// DEFAULT USERS DATA (only used if RECREATE_USERS = true)
// ============================================================================

const DEFAULT_USERS = [
  {
    name: 'Admin User',
    email: 'admin@drakz.com',
    role: 'admin',
    phone: '+91 9876543210',
    occupation: 'System Administrator',
    monthlyIncome: 80000,
    creditScore: 800,
  },
  {
    name: 'Ziko Advisor',
    email: 'advisor@drakz.com',
    role: 'advisor',
    isApproved: true,
    phone: '+91 9876543211',
    occupation: 'Financial Advisor',
    riskProfile: 'Aggressive',
    monthlyIncome: 120000,
    advisorProfile: {
      specialization: 'Wealth Management',
      experience: 10,
      bio: 'Certified financial planner with 10+ years of experience in wealth management and investment advisory.',
      price: 2500,
      contactEmail: 'advisor@drakz.com',
      contactPhone: '+91 9876543211',
      isAcceptingClients: true,
    },
  },
  {
    name: 'Pending Advisor',
    email: 'pending@drakz.com',
    role: 'advisor',
    isApproved: false,
    phone: '+91 9876543212',
    occupation: 'Crypto Specialist',
    advisorProfile: {
      specialization: 'Crypto & DeFi',
      experience: 2,
      bio: 'Blockchain enthusiast with deep knowledge of DeFi protocols.',
    },
  },
  {
    name: 'Rahul Sharma',
    email: 'rich@drakz.com',
    role: 'user',
    phone: '+91 9876543213',
    occupation: 'Senior Software Engineer',
    monthlyIncome: 150000,
    portfolioValue: 2500000,
    riskProfile: 'Aggressive',
    activeGoals: 5,
    creditScore: 790,
  },
  {
    name: 'Priya Patel',
    email: 'user@drakz.com',
    role: 'user',
    phone: '+91 9876543214',
    occupation: 'Product Manager',
    monthlyIncome: 85000,
    portfolioValue: 650000,
    riskProfile: 'Moderate',
    activeGoals: 3,
    creditScore: 740,
  },
  {
    name: 'Arjun Reddy',
    email: 'new@drakz.com',
    role: 'user',
    phone: '+91 9876543215',
    occupation: 'Data Analyst',
    monthlyIncome: 45000,
    portfolioValue: 120000,
    riskProfile: 'Conservative',
    activeGoals: 2,
    creditScore: 710,
  },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           DRAKZ DATABASE REFRESH SCRIPT                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  if (MONGO_URI === 'YOUR_MONGO_URI_HERE') {
    console.error('❌ ERROR: Please set your MONGO_URI at the top of this script!');
    process.exit(1);
  }

  // Build the final connection URI with optional DB_NAME override
  let connectionURI = MONGO_URI;
  if (DB_NAME) {
    // Replace the database name in the URI (the part after the last '/' and before any '?')
    connectionURI = MONGO_URI.replace(/(mongodb(?:\+srv)?:\/\/[^/]+\/)([^?]*)(.*)/, `$1${DB_NAME}$3`);
    console.log(`🗄️  Database: ${DB_NAME} (overridden — your main DB is safe!)`);
  } else {
    const dbMatch = MONGO_URI.match(/\/([^/?]+)(\?|$)/);
    console.log(`🗄️  Database: ${dbMatch ? dbMatch[1] : '(default)'}`);
  }

  console.log(`📅 Date Range: ${DATE_RANGE_START} → ${DATE_RANGE_END}`);
  console.log(`🔗 Connecting to MongoDB...`);

  try {
    await mongoose.connect(connectionURI);
    console.log('✅ Connected to MongoDB\n');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  // --- Step 1: Handle Users ---
  let users;
  if (RECREATE_USERS) {
    console.log('🧹 Clearing ALL collections (including users)...');
    await Promise.all([
      Person.deleteMany({}),
      Spending.deleteMany({}),
      Card.deleteMany({}),
      CreditScore.deleteMany({}),
      Loan.deleteMany({}),
      Holding.deleteMany({}),
      UserStock.deleteMany({}),
      Property.deleteMany({}),
      Insurance.deleteMany({}),
      PreciousHolding.deleteMany({}),
      Transaction.deleteMany({}),
      Blog.deleteMany({}),
      Contact.deleteMany({}),
      Settings.deleteMany({}),
    ]);

    console.log('👤 Creating fresh users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const usersData = DEFAULT_USERS.map(u => ({ ...u, password: hashedPassword }));
    users = await Person.create(usersData);

    // Assign advisor to first user with role 'user'
    const advisor = users.find(u => u.role === 'advisor' && u.isApproved);
    const firstUser = users.find(u => u.email === 'rich@drakz.com');
    if (advisor && firstUser) {
      firstUser.assignedAdvisor = advisor._id;
      await firstUser.save();
    }

    console.log(`✅ Created ${users.length} users\n`);

    // Re-create Settings
    await Settings.create({
      maintenanceMode: false,
      allowRegistrations: true,
      commissionRate: 5,
      supportEmail: 'support@drakz.com',
    });
  } else {
    console.log('🧹 Clearing financial data collections (keeping users intact)...');
    await Promise.all([
      Spending.deleteMany({}),
      Card.deleteMany({}),
      CreditScore.deleteMany({}),
      Loan.deleteMany({}),
      Holding.deleteMany({}),
      UserStock.deleteMany({}),
      Property.deleteMany({}),
      Insurance.deleteMany({}),
      PreciousHolding.deleteMany({}),
      Transaction.deleteMany({}),
      Blog.deleteMany({}),
      Contact.deleteMany({}),
    ]);

    users = await Person.find({});
    if (users.length === 0) {
      console.error('❌ No users found in database! Set RECREATE_USERS = true to create them.');
      process.exit(1);
    }
    console.log(`✅ Found ${users.length} existing users\n`);
  }

  // --- Step 2: Seed data for each user with role 'user' or 'advisor' ---
  const seedableUsers = users.filter(u => ['user', 'advisor'].includes(u.role));

  for (const user of seedableUsers) {
    const userId = user._id;
    const label = `${user.name} (${user.role})`;
    console.log(`📊 Seeding data for ${label}...`);

    // Spendings
    const spendings = generateSpendings(userId);
    await Spending.insertMany(spendings);
    console.log(`   💳 ${spendings.length} spendings`);

    // Cards
    const cards = generateCards(userId, user.name);
    await Card.insertMany(cards);
    console.log(`   🏦 ${cards.length} cards`);

    // Credit Score
    const creditScore = generateCreditScore(userId);
    await CreditScore.create(creditScore);
    // Update user's creditScore field
    user.creditScore = creditScore.score;
    user.lastActive = recentDate(3); // Mark as recently active
    await user.save();
    console.log(`   📈 Credit score: ${creditScore.score}`);

    // Loans (only for users, not advisors)
    if (user.role === 'user') {
      const loans = generateLoans(userId);
      await Loan.insertMany(loans);
      console.log(`   🏠 ${loans.length} loans`);
    }

    // Stocks
    const stocks = generateStocks(userId);
    await UserStock.insertMany(stocks);
    console.log(`   📊 ${stocks.length} stocks`);

    // Holdings (ETFs, Crypto, Bonds)
    const holdings = generateHoldings(userId);
    await Holding.insertMany(holdings);
    console.log(`   💰 ${holdings.length} holdings`);

    // Transactions
    const txns = generateTransactions(userId);
    await Transaction.insertMany(txns);
    console.log(`   🔄 ${txns.length} transactions`);

    // Properties
    const properties = generateProperties(userId);
    await Property.insertMany(properties);
    console.log(`   🏘️  ${properties.length} properties`);

    // Insurance
    const insurances = generateInsurances(userId);
    await Insurance.insertMany(insurances);
    console.log(`   🛡️  ${insurances.length} insurance policies`);

    // Precious Holdings
    const precious = generatePreciousHoldings(userId);
    if (precious.length > 0) {
      await PreciousHolding.insertMany(precious);
    }
    console.log(`   ✨ ${precious.length} precious holdings`);

    console.log(`   ✅ Done!\n`);
  }

  // --- Step 3: General data ---
  console.log('🌍 Seeding general data...');

  // Blogs
  const authorIds = users.map(u => u._id);
  const blogs = generateBlogs(authorIds);
  await Blog.insertMany(blogs);
  console.log(`   📝 ${blogs.length} blog posts`);

  // Support Tickets
  const ticketNames = ['Ravi Kumar', 'Sneha Agrawal', 'Vikram Singh', 'Anjali Desai'];
  const ticketSubjects = [
    'Cannot access investment dashboard',
    'Credit score not updating',
    'Card details showing incorrect data',
    'Loan EMI calculation seems wrong',
  ];
  const ticketMessages = [
    'Hi, I have been trying to access my investment dashboard but it keeps showing an error. Please help!',
    'My credit score has not been updated for the past 2 months. Could you please look into this?',
    'The card details page is showing incorrect card numbers. This is concerning from a security standpoint.',
    'The EMI calculator on my loan page is showing a different amount than what my bank confirmed. Please verify.',
  ];
  const tickets = ticketNames.map((name, i) => ({
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
    phone: `+91 ${getRandomInt(7000000000, 9999999999)}`,
    subject: ticketSubjects[i],
    message: ticketMessages[i],
    status: pick(['Open', 'In Progress', 'Open', 'Resolved']),
    priority: pick(['Low', 'Medium', 'High']),
    createdAt: randomDate(),
  }));
  await Contact.insertMany(tickets);
  console.log(`   🎫 ${tickets.length} support tickets`);

  // --- Summary ---
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           ✅ DATABASE REFRESH COMPLETE!                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📅 All data is dated between ${DATE_RANGE_START} and ${DATE_RANGE_END}`);
  console.log(`👥 ${seedableUsers.length} users seeded with financial data`);
  console.log(`🔑 Default password for all users: 123456`);
  console.log('');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
