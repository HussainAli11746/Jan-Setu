import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://alihussain11746_db_user:q61WuCZm1vgw8ywt@cluster0.ehyemo8.mongodb.net/jansetu';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };
    cachedPromise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    }).catch(err => {
      cachedPromise = null;
      console.error('MongoDB connection error:', err.message);
      throw err;
    });
  }

  return cachedPromise;
};
