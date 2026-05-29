import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ── POST /api/register ──────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { fullName, phone, email, password, companyName, isAgency } = req.body;

  if (!fullName || !phone || !email || !password) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      phone,
      email,
      password: hashed,
      companyName: companyName || '',
      isAgency: isAgency === true || isAgency === 'true',
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── POST /api/login ─────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── GET /api/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ user: sanitize(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── Helper ──────────────────────────────────────────────────────────────────
function sanitize(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    companyName: user.companyName,
    isAgency: user.isAgency,
    avatar: user.avatar,
  };
}

export default router;
