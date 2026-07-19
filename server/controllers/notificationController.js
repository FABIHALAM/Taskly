const Notification = require('../models/Notification')
const { sendSuccess, sendError } = require('../utils/response')

/**
 * Helper — Call this from other controllers to create notifications automatically.
 * Example: await createNotification('task_assigned', userId, 'Task', task._id, 'Alice assigned you a task: Fix login bug')
 */
const createNotification = async (type, recipientId, targetType, targetId, message) => {
  try {
    await Notification.create({ type, recipient: recipientId, targetType, targetId, message })
  } catch (err) {
    // Non-critical — log and continue
    console.error('Notification creation failed:', err.message)
  }
}

/**
 * @route   GET /api/notifications
 * @access  Protected
 * Get all notifications for the logged-in user (unread first).
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ isRead: 1, createdAt: -1 })
      .limit(50)

    const unreadCount = notifications.filter((n) => !n.isRead).length

    return sendSuccess(res, 200, 'Notifications fetched', {
      unreadCount,
      notifications,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

/**
 * @route   PATCH /api/notifications/:id/read
 * @access  Protected
 * Mark a single notification as read.
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { isRead: true },
      { new: true }
    )
    if (!notification) return sendError(res, 404, 'Notification not found')
    return sendSuccess(res, 200, 'Notification marked as read', notification)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

/**
 * @route   PATCH /api/notifications/read-all
 * @access  Protected
 * Mark ALL notifications as read for the logged-in user.
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true })
    return sendSuccess(res, 200, 'All notifications marked as read')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

/**
 * @route   DELETE /api/notifications/:id
 * @access  Protected
 * Delete a specific notification.
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    })
    if (!notification) return sendError(res, 404, 'Notification not found')
    return sendSuccess(res, 200, 'Notification deleted')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
}
