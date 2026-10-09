const jwt = require('jsonwebtoken');
const { httpError } = require('./httpError');

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return next(httpError(401, 'Authentication required.'));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, email: payload.email };
    return next();
  } catch {
    return next(httpError(401, 'Session expired. Please log in again.'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have access to this resource.'));
    }
    return next();
  };
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That email is already in use.' });
  }
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
      ...(err.fields ? { fields: err.fields } : {}),
    });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = { asyncHandler, requireAuth, requireRole, errorHandler };
