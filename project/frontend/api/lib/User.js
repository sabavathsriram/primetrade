import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName:    { type: String, required: true, trim: true },
    phone:       { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true },
    companyName: { type: String, default: '' },
    isAgency:    { type: Boolean, default: false },
    avatar:      { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent model re-compilation on hot-reload in serverless
export default mongoose.models.User || mongoose.model('User', userSchema);
