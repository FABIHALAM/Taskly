const mongoose = require('mongoose')

/**
 * Comment Collection
 * Stores individual messages posted on a task.
 * Kept as a separate collection (not embedded in Task) so that
 * tasks with many comments do not become bloated documents.
 */
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Comment', commentSchema)
