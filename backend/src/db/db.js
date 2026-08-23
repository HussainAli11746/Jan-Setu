import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

let cachedConnection = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    }).then((m) => {
      console.log('MongoDB connected');
      return m;
    }).catch(err => {
      cachedConnection = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });
  }

  await cachedConnection;
  return mongoose.connection;
};
