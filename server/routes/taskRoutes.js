const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { createTask, getTasksByProject, updateTaskStatus, deleteTask } = require('../controllers/taskController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),
]

router.post('/:projectId', protect, taskValidation, validateRequest, createTask)
router.get('/:projectId', protect, getTasksByProject)
router.patch('/:taskId/status', protect, updateTaskStatus)
router.delete('/:taskId', protect, deleteTask)

module.exports = router