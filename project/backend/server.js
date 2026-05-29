const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'popx_secret_key_2024';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// In-memory user store (replace with a real DB in production)
const users = [];

// ─── Helper ────────────────────────────────────────────────────────────────
function findUserByEmail(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ─── Routes ────────────────────────────────────────────────────────────────

/**
 * POST /api/register
 * Body: { fullName, phone, email, password, companyName, isAgency }
 */
app.post('/api/register', async (req, res) => {
  const { fullName, phone, email, password, companyName, isAgency } = req.body;

  if (!fullName || !phone || !email || !password) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    fullName,
    phone,
    email,
    password: hashedPassword,
    companyName: companyName || '',
    isAgency: isAgency === true || isAgency === 'true',
    avatar: null,
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      companyName: newUser.companyName,
      isAgency: newUser.isAgency,
      avatar: newUser.avatar,
    },
  });
});

/**
 * POST /api/login
 * Body: { email, password }
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.status(200).json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      isAgency: user.isAgency,
      avatar: user.avatar,
    },
  });
});

/**
 * GET /api/me
 * Header: Authorization: Bearer <token>
 */
app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        companyName: user.companyName,
        isAgency: user.isAgency,
        avatar: user.avatar,
      },
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`PopX backend running at http://localhost:${PORT}`);
});
