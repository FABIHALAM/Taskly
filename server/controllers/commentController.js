const Comment = require('../models/Comment')
const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')
const { createNotification } = require('./notificationController')

// Add a new comment (text or voice note audioUrl)
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params
    const { text, audioUrl } = req.body

    const task = await Task.findById(taskId)
    if (!task || task.isArchived) {
      return sendError(res, 404, 'Task not found')
    }

    const comment = await Comment.create({
      text: text || '',
      audioUrl: audioUrl || null,
      task: taskId,
      author: req.userId,
    })

    const populated = await comment.populate('author', 'name email')

    if (task.assignee && task.assignee.toString() !== req.userId) {
      await createNotification(
        'comment_added',
        task.assignee,
        'Comment',
        comment._id,
        audioUrl ? `Voice note comment on your task: "${task.title}"` : `New comment on your task: "${task.title}"`
      )
    }

    return sendSuccess(res, 201, 'Comment added successfully', populated)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
    if (!task || task.isArchived) {
      return sendError(res, 404, 'Task not found')
    }

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })

    return sendSuccess(res, 200, 'Comments fetched successfully', comments)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const { text } = req.body

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return sendError(res, 404, 'Comment not found')
    }

    if (comment.author.toString() !== req.userId) {
      return sendError(res, 403, 'You can only edit your own comments')
    }

    comment.text = text
    await comment.save()

    const populated = await comment.populate('author', 'name email')

    return sendSuccess(res, 200, 'Comment updated successfully', populated)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return sendError(res, 404, 'Comment not found')
    }

    if (comment.author.toString() !== req.userId) {
      return sendError(res, 403, 'You can only delete your own comments')
    }

    await comment.deleteOne()

    return sendSuccess(res, 200, 'Comment deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { addComment, getCommentsByTask, updateComment, deleteComment }
