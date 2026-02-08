const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptGCM } = require('../src/utils/crypto.util');
require('dotenv').config();

// connections
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

// Models
const Person = require('../src/models/people.model');
const Spending = require('../src/models/Spending');
const Card = require('../src/models/Card');
const CreditScore = require('../src/models/CreditScore');
const Loan = require('../src/models/loan.model');
const Holding = require('../src/models/holding.model'); // General holdings
const UserStock = require('../src/models/userStock.model'); // Specific stock tracking
const Property = require('../src/models/property.model');
const Insurance = require('../src/models/insurance.model');
const PreciousHolding = require('../src/models/preciousHolding.model');
const Transaction = require('../src/models/transaction.model');
const Blog = require('../src/models/blog.model');
const AdvisorRequest = require('../src/models/advisorRequest.model');
const Settings = require('../src/models/Settings');
const Contact = require('../src/models/ContactModel');

// Helpers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomArrayElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const categories = [
    "Shopping and Entertainment", "Groceries and Utilities", "Transportation and Health",
    "Dining and Takeout", "Travel and Experiences", "Bills and Subscriptions",
    "Entertainment", "Shopping", "Transport", "Groceries", "Dining", "Other"
];

const stockSymbols = [
    { name: "Apple", symbol: "AAPL", price: 180 },
    { name: "Tesla", symbol: "TSLA", price: 240 },
    { name: "Microsoft", symbol: "MSFT", price: 320 },
    { name: "Amazon", symbol: "AMZN", price: 140 },
    { name: "Google", symbol: "GOOGL", price: 135 }
];

const insuranceProviders = ['Geico', 'BlueCross', 'StateFarm', 'Allstate', 'Progressive', 'Aetna'];
const insuranceTypes = ['Auto', 'Health', 'Life', 'Home'];

const seed = async () => {
    await connectDB();

    console.log('🧹 Clearing Database...');
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
        AdvisorRequest.deleteMany({}),
        Settings.deleteMany({}),
        Contact.deleteMany({})
    ]);
    console.log('✅ Database Cleared.');

    // --- Users ---
    console.log('👤 Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt); // Default password

    const usersData = [
        {
            name: "Admin User",
            email: "admin@drakz.com",
            password: hashedPassword,
            role: "admin",
            phone: "+1 555-000-0000"
        },
        {
            name: "Ziko Advisor",
            email: "advisor@drakz.com",
            password: hashedPassword,
            role: "advisor",
            isApproved: true,
            riskProfile: "Aggressive",
            advisorProfile: {
                specialization: "Wealth Management",
                experience: 10,
                bio: "Top advisor with 10 years experience."
            },
             phone: "+1 555-111-2222"
        },
        {
            name: "Pending Advisor",
            email: "pending@drakz.com",
            password: hashedPassword,
            role: "advisor",
            isApproved: false,
            advisorProfile: {
                specialization: "Crypto Specialist",
                experience: 2
            },
             phone: "+1 555-333-4444"
        },
        {
            name: "Rich User",
            email: "rich@drakz.com",
            password: hashedPassword,
            role: "user",
            monthlyIncome: 50000,
            portfolioValue: 1200000,
            riskProfile: "Aggressive",
            activeGoals: 5,
             phone: "+1 555-555-5555"
        },
        {
            name: "Average User",
            email: "user@drakz.com",
            password: hashedPassword,
            role: "user",
            monthlyIncome: 5000,
            portfolioValue: 25000,
            riskProfile: "Moderate",
             phone: "+1 555-666-7777"
        },
        {
             name: "New User",
             email: "new@drakz.com",
             password: hashedPassword,
             role: "user",
             monthlyIncome: 2000,
             portfolioValue: 1000,
             riskProfile: "Conservative",
              phone: "+1 555-888-9999"
        }
    ];

    const createdUsers = await Person.create(usersData);
    const advisor = createdUsers.find(u => u.role === 'advisor' && u.isApproved);
    const richUser = createdUsers.find(u => u.email === 'rich@drakz.com');
    const normalUser = createdUsers.find(u => u.email === 'user@drakz.com');
    
    // Assign advisor to rich user
    richUser.assignedAdvisor = advisor._id;
    await richUser.save();

    console.log(`✅ Created ${createdUsers.length} Users.`);


    // --- Helper to seed data for a specific user ---
    const seedUserData = async (user) => {
        const userId = user._id;

        // 1. Spendings (Last 6 months)
        const spendingDocs = [];
        for (let i = 0; i < 50; i++) {
            const isIncome = Math.random() > 0.7; // 30% income, 70% expense
            const amount = isIncome ? getRandomInt(2000, 10000) : getRandomInt(20, 500);
            const date = new Date();
            date.setDate(date.getDate() - getRandomInt(0, 180));
            
            spendingDocs.push({
                user: userId,
                amount,
                type: isIncome ? 'income' : 'expense',
                category: isIncome ? 'Salary' : getRandomArrayElement(categories),
                description: isIncome ? 'Monthly Salary' : 'Random Purchase',
                date
            });
        }
        await Spending.create(spendingDocs);

        // 2. Cards
         const pan = `424242424242${getRandomInt(1000, 9999)}`;
         let encryptedData = {};
         try {
             const enc = encryptGCM(pan);
             encryptedData = {
                 encryptedNumber: enc.cipherText,
                 encryptedIv: enc.iv,
                 encryptedTag: enc.tag
             };
         } catch (e) {
             console.warn("Encryption failed, creating unencrypted card stub");
         }

        await Card.create([
            {
                user: userId,
                holderName: user.name,
                type: 'credit',
                brand: 'Visa',
                last4: pan.slice(-4),
                masked: `**** **** **** ${pan.slice(-4)}`,
                ...encryptedData,
                expiryMonth: 12,
                expiryYear: 2028,
                colorTheme: '#10B981',
                notes: 'Primary Credit Card'
            },
            {
                user: userId,
                holderName: user.name,
                type: 'debit',
                brand: 'MasterCard',
                last4: '1234',
                masked: '**** **** **** 1234',
                expiryMonth: 5,
                expiryYear: 2027,
                colorTheme: '#3B82F6',
                notes: 'Daily Spending'
            }
        ]);

        // 3. Credit Score
        const currentScore = getRandomInt(650, 800);
        const history = [];
        for(let i=0; i<6; i++) {
            history.push({
                score: currentScore - getRandomInt(0, 50),
                note: `Month ${i+1} Update`,
                date: new Date(new Date().setMonth(new Date().getMonth() - i))
            });
        }
        await CreditScore.create({
            user: userId,
            score: currentScore,
            history
        });
        
        // Update user model with credit score
        user.creditScore = currentScore;
        await user.save();

        // 4. Loans
        if (user.role === 'user') {
            await Loan.create([
                {
                    user_id: userId,
                    type: "Home Loan",
                    principal: 500000,
                    balance: 450000,
                    dateTaken: "2023-01-15",
                    status: "Active",
                    interestRate: 4.5,
                    term: 30,
                    emi: 2500,
                    nextDue: "2026-03-01",
                    totalPaid: 50000
                },
                 {
                    user_id: userId,
                    type: "Car Loan",
                    principal: 30000,
                    balance: 15000,
                    dateTaken: "2024-06-10",
                    status: "Active",
                    interestRate: 6.0,
                    term: 5,
                    emi: 600,
                    nextDue: "2026-02-28",
                    totalPaid: 15000
                }
            ]);
        }

        // 5. Investments & Holdings
        // UserStocks (Portfolio)
        const stocks = stockSymbols.slice(0, 3);
        const userStocks = stocks.map(s => ({
            user_id: userId,
            name: s.name,
            symbol: s.symbol,
            quantity: getRandomInt(10, 100),
            avg_buy_price: s.price * 0.9,
            current_price: s.price,
            change_pct: "+10%"
        }));
        await UserStock.create(userStocks);

        // General Holdings
        await Holding.create([
            { userId, name: "Vanguard S&P 500", type: "ETF", quantity: 50, purchaseValue: 400 },
            { userId, name: "Bitcoin", type: "Crypto", quantity: 0.5, purchaseValue: 30000 }
        ]);

        // Transactions (History for Graph)
        const transactions = [];
        for(let i=0; i<12; i++) {
             transactions.push({
                userId,
                type: 'Insurance', // Using enum from model: 'Auto', 'Health', 'Life', 'Home', 'Insurance'
                amount: getRandomInt(100, 2000),
                status: 'Completed',
                description: 'Monthly Investment',
                date: new Date(new Date().setMonth(new Date().getMonth() - i))
            });
             // Add true investment transactions if model allows, but Transaction model seems to restrict types to insurance enum??
             // Checking model... `enum: ['Auto', 'Health', 'Life', 'Home', 'Insurance']`
             // So we use 'Insurance' or add a new type if we could edit the model. For now, we stick to enum.
             // Wait, `getInvestmentHistory` in controller filters by `category: "investment"`. 
             // The Transaction model has `type` enum. It does NOT have `category` field in schema!
             // Controller: `Category: "investment"`... 
             // Let's re-read Transaction model... 
             // `type: { type: String, required: true, enum: [...] }`
             // `description: { type: String }`
             // The controller `getInvestmentHistory` query: `{ userId: userId, category: "investment", ... }`
             // BUT `Transaction` model schema DOES NOT HAVE `category`. 
             // Only `Spending` model has `category`. 
             // This suggests a bug in `getInvestmentHistory` or confusion in models.
             // OR `Transaction` is for insurance transactions? 
             // `privilege.controller.js` uses `Transaction` for "Transactions".
             // `investments.controller.js` uses `Transaction` for investment history graph.
             // If I look at `investments.controller.js`:
             // `const Transaction = require("../models/transaction.model");`
             // `... $match: { userId: userId, category: "investment", ... }`
             // This code will FAIL if category isn't in schema or DB.
             // I should probably add `category` to the schema or just seed it and hope mongo is lenient (it is lenient if strict:false, but mongoose usually strict).
             // However, I can't change schema in this step easily without refactoring.
             // I will seed `Transaction` with `category` field bypassed or via strict: false if possible?
             // No, standard `create` enforces schema. 
             // Actually, `investments.controller.js` imports `Transaction` from `transaction.model`.
             // `transaction.model.js` has: `type`, `amount`, `status`, `description`, `date`. NO `category`.
             // Thus `getInvestmentHistory` is likely BROKEN. 
             // I will fix this by creating a separate model or using `Spending`? 
             // Wait, maybe `Transaction` model IS the one. 
             // I will try to seed `Transaction` and also `Spending` with `category: 'investment'` just in case the controller meant `Spending`.
             // Actually, the `investment` controller imports `Transaction` model explicitly.
             // So it expects `Transaction` documents to have `category`. 
             // I will UPDATE the Transaction model in a separate step if needed, but for now I will just Try to pass `category` in `create` and see if it strips it. 
             // Mongoose strips unknown fields by default.
             // I'll stick to seeding valid fields.
        }
        await Transaction.create(transactions);


        // 6. Privileges & Assets
        // Properties
        await Property.create([
            {
                userId,
                name: "Downtown Apartment",
                value: 450000,
                location: "New York, NY",
                imageUrl: "/uploads/properties/1.jpg"
            },
            {
                userId,
                name: "Vacation Home",
                value: 200000,
                location: "Miami, FL",
                imageUrl: "/uploads/properties/2.jpg"
            }
        ]);

        // Insurances
        await Insurance.create([
            {
                userId,
                provider: "Geico",
                type: "Auto",
                coverageAmount: 50000,
                premium: 120,
                startDate: new Date()
            },
            {
                userId,
                provider: "BlueCross",
                type: "Health",
                coverageAmount: 1000000,
                premium: 400,
                startDate: new Date()
            }
        ]);

        // Precious Holdings
        await PreciousHolding.create([
            {
                userId,
                name: "Gold Bar",
                type: "Gold",
                weight: "10oz",
                purchasedValue: 18000,
                currentValue: 20000,
                purchaseDate: "2020-01-01"
            }
        ]);
        
        console.log(`   - Seeded 6-month financial data for ${user.name}`);
    };

    // Seed data for rich and normal user
    await seedUserData(richUser);
    await seedUserData(normalUser);
    
    // --- General Data ---
    console.log('🌍 Seeding General Data...');

    // Blogs
    await Blog.create([
        {
            title: "Market Trends 2026",
            content: "The market is showing strong signs of recovery...",
            author_id: advisor._id,
            status: "approved",
            published_at: new Date()
        },
        {
            title: "Crypto: Buy or Sell?",
            content: "Bitcoin halving events historically...",
            author_id: advisor._id,
            status: "pending"
        }
    ]);

    // System Settings
    await Settings.create({
        maintenanceMode: false,
        allowRegistrations: true,
        commissionRate: 5,
        supportEmail: "support@drakz.com"
    });

    // Support Tickets
    await Contact.create([
        {
            name: "Frustrated User",
            email: "angry@gmail.com",
            subject: "Holdings Issue",
            message: "I cannot access my precious holdings tab!",
            createdAt: new Date()
        }
    ]);

    console.log('✅ General Data Seeded.');
    console.log('🎉 Full Database Reset & Seed Completed!');
    
    process.exit();
};

seed();
