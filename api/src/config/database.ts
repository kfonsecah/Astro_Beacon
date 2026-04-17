import mongoose from 'mongoose';
import { config } from './index.js';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.DATABASE.URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    conn.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    conn.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error instanceof Error ? error.message : 'Unknown error');
    // Exit with error in production, but allow dev to continue
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;