const mongoose = require("mongoose");
require("dotenv").config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Transaction = require("../src/models/transaction.model.js");
  const userId = new mongoose.Types.ObjectId("69886c276bd27cafef0f3daa");
  
  const types = await Transaction.aggregate([
    { $match: { userId } },
    { $group: { _id: "$type", count: { $sum: 1 }, total: { $sum: "$amount" } } }
  ]);
  
  console.log("Types for User:", types);
  process.exit(0);
}
check();
