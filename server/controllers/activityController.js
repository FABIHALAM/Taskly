const ActivityLog = require('../models/ActivityLog')
const { sendSuccess, sendError } = require('../utils/response')

const getRecentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20)

    return sendSuccess(res, 200, 'Activity fetched successfully', logs)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { getRecentActivity }