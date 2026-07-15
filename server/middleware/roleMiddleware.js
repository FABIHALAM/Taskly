const User = require('../models/User')
const { sendError } = require('../utils/response')

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)

    if (!user || user.role !== 'admin') {
      return sendError(res, 403, 'Access denied: admin role required')
    }

    next()
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { requireAdmin }