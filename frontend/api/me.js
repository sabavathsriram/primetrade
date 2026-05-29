import jwt from 'jsonwebtoken';
import { connectDB } from './lib/db.js';
import User from './lib/User.js';
import { setCors, handleOptions } from './lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
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
    console.error('Me error:', err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}
