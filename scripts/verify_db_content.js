const mongoose = require('mongoose');
require('dotenv').config();

// Models
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
const AdvisorRequest = require('../src/models/advisorRequest.model');
const Settings = require('../src/models/Settings');
const Contact = require('../src/models/ContactModel');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected for verification.\n');

        const models = {
            Person, Spending, Card, CreditScore, Loan, Holding, UserStock, 
            Property, Insurance, PreciousHolding, Transaction, Blog, 
            AdvisorRequest, Settings, Contact
        };

        for (const [name, model] of Object.entries(models)) {
            const count = await model.countDocuments();
            console.log(`📦 ${name}: ${count} documents`);
            if (count > 0) {
                const sample = await model.findOne().lean();
                console.log(`   Sample ID: ${sample._id}`);
            }
        }
        
        console.log('\n✅ Verification Complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
