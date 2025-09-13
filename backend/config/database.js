const mongoose = require('mongoose');
require('dotenv').config();

// Mongo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airplane_reservation';

const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI, { maxPoolSize: 10 });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const testConnection = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectMongo();
    }
    console.log('✅ MongoDB connection is healthy');
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  return Promise.resolve();
};

const insertSampleData = async () => {
  return Promise.resolve();
};

module.exports = {
  connectMongo,
  testConnection,
  initializeDatabase,
  insertSampleData
};
