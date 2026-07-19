const mongoose = require('mongoose')

/**
 * Notification Collection
 * Stores in-app notifications for users.
 * Created automatically when:
 *  - A task is assigned to a user
 *  - A comment is added on a task assigned to the user
 *  - A user is added to a project
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_updated',
        'comment_added',
        'member_added',
        'task_overdue',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Reference to the related resource
    targetType: {
      type: String,
      enum: ['Task', 'Project', 'Comment'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
