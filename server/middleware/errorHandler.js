/**
 * Centralized error handler middleware.
 * Must be registered AFTER all routes (app.use at the bottom of server.js).
 * Catches any error passed via next(err) and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    })
  }

  // Generic fallback
  const statusCode = err.statusCode || 500
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  })
}

module.exports = errorHandler
