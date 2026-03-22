const { admin } = require('../config/firebase');

exports.verifyToken = async (req, res, next) => {
  // Try to get token from headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For local mocking, we will just allow it or set a dummy user
    req.user = { uid: 'mock_user_123', role: 'passenger' };
    return next();
    // In production: return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token with Firebase admin
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = decodedToken;
    
    // Mock user for now since firebase admin lacks proper credentials
    req.user = { uid: 'mock_user_456', email: 'mock@example.com' };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
