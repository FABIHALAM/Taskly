const Comment = require('../models/Comment')
const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/comments/:taskId
 * @access  Protected
 * Add a new comment to a task.
 */
const addComment = async (req, res) => {
  try {
    const { taskId } = req.params
    const { text } = req.body

    // Make sure the task exists and is not archived
    const task = await Task.findById(taskId)
    if (!task || task.isArchived) {
      return sendError(res, 404, 'Task not found')
    }

    const comment = await Comment.create({
      text,
      task: taskId,
      author: req.userId,
    })

    // Return comment with author details populated
    const populated = await comment.populate('author', 'name email')

    return sendSuccess(res, 201, 'Comment added successfully', populated)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

/**
 * @route   GET /api/comments/:taskId
 * @access  Protected
 * Get all comments for a task, newest first.
 */
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

/**
 * @route   PUT /api/comments/:commentId
 * @access  Protected
 * Edit a comment — only the original author can edit.
 */
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

/**
 * @route   DELETE /api/comments/:commentId
 * @access  Protected
 * Delete a comment — only the original author can delete.
 */
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
