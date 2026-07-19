const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment,
} = require('../controllers/commentController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

// ─── Validation ───────────────────────────────────────────────────────────────

const commentValidation = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /comments/{taskId}:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: This task looks good, let's ship it!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Task not found
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments (newest first)
 */
router.post('/:taskId', protect, commentValidation, validateRequest, addComment)
router.get('/:taskId', protect, getCommentsByTask)

/**
 * @swagger
 * /comments/edit/{commentId}:
 *   put:
 *     summary: Edit a comment (author only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       403:
 *         description: Not the author
 * /comments/edit/{commentId}:
 *   delete:
 *     summary: Delete a comment (author only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Not the author
 */
router.put('/edit/:commentId', protect, commentValidation, validateRequest, updateComment)
router.delete('/edit/:commentId', protect, deleteComment)

module.exports = router
