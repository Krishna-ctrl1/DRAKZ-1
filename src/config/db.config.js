const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const maxRetries = Number(process.env.DB_CONNECT_RETRIES || 5);
  const retryDelayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 3000);

  if (!mongoUri) {
    console.error('DB Connection Error: MONGO_URI is not set');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        family: 4,
      });
      console.log('MongoDB Connected');
      return;
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      console.error(`DB Connection Error (attempt ${attempt}/${maxRetries}):`, err.message);

      if (isLastAttempt) {
        console.error('MongoDB connection failed after max retries. Exiting process.');
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

module.exports = connectDB;