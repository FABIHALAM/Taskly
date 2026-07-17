const ActivityLog = require('../models/ActivityLog')

const logActivity = async (action, userId, targetType, targetId) => {
  try {
    await ActivityLog.create({
      action,
      performedBy: userId,
      targetType,
      targetId,
    })
  } catch (error) {
    console.error('Failed to log activity:', error.message)
  }
}

module.exports = logActivity