const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@healthconnect.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@2025';

    // Check admin credentials
    if (email === adminEmail && password === adminPassword) {
      const token = jwt.sign(
        { id: 'admin', email, role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Set cookie for better security
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return res.json({
        token,
        user: {
          id: 'admin',
          email,
          role: 'admin'
        }
      });
    }

    // Invalid credentials
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

// Protected route example
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  router,
  verifyToken
};
