const mongoose = require('mongoose');
const dns = require('dns');

const configureDns = () => {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (error) {
    console.warn(`Could not override DNS servers: ${error.message}`);
  }
};

const connectDB = async () => {
  configureDns();

  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_learning_platform';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      tls: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
