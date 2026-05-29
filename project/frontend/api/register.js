import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './lib/db.js';
import User from './lib/User.js';
import { setCors, handleOptions } from './lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    await connectDB();

    const { fullName, phone, email, password, companyName, isAgency } = req.body;

    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      phone,
      email,
      password: hashedPassword,
      companyName: companyName || '',
      isAgency: isAgency === true || isAgency === 'true',
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        isAgency: user.isAgency,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
