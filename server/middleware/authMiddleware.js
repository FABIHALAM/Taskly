const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  let token

  // Check if Authorization header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token (remove "Bearer " part)
      token = req.headers.authorization.split(' ')[1]

      // Verify token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Attach user id to request object, so next functions can use it
      req.userId = decoded.id

      next() // Token valid, proceed to the actual route
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}

module.exports = protect