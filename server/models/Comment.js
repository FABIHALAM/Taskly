const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    audioUrl: {
      type: String,
      default: null,
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
