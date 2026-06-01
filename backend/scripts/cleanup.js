import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

await mongoose.connect(process.env.MONGODB_URI);

const result = await User.deleteMany({
  fullName: { $in: ['maxy', 'xyz'] }
});

console.log(`Deleted ${result.deletedCount} user(s).`);
await mongoose.disconnect();
