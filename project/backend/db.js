import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  console.log('✅ MongoDB connected');
}
