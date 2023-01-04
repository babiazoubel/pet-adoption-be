const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

// middleware to validate token
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Access denied' });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, 'oursecrettomakemorereliable');
    req.user = verified;
    next();

  } catch (error) {
    return res.status(400).json({ message: 'Access denied' });
  }
};

module.exports = verifyToken;
