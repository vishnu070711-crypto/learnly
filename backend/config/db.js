const mongoose = require('mongoose');
const dns = require('dns');

const configureDns = () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (error) {
    console.warn(`Could not override DNS servers: ${error.message}`);
  }
};

const resolveMongoUri = () => {
  const candidates = [process.env.MONGODB_URI, process.env.MONGO_URI];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() && /^(mongodb(?:\+srv)?:\/\/)/i.test(candidate.trim())) {
      return candidate.trim();
    }
  }

  return 'mongodb://127.0.0.1:27017/online_learning_platform';
};

const connectDB = async () => {
  configureDns();

  try {
    const uri = resolveMongoUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      tls: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.VERCEL === '1') {
      return null;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
