const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  createTask,
  getTasksByProject,
  updateTask,
  toggleSubtask,
  generateAiSubtasks,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority value'),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status value'),
]

const updateTaskValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
]

router.post('/ai-suggest', protect, generateAiSubtasks)
router.patch('/:taskId/subtasks/:subtaskId', protect, toggleSubtask)
router.post('/:projectId', protect, taskValidation, validateRequest, createTask)
router.get('/:projectId', protect, getTasksByProject)
router.put('/:taskId', protect, updateTaskValidation, validateRequest, updateTask)
router.patch('/:taskId/status', protect, updateTaskStatus)
router.delete('/:taskId', protect, deleteTask)

module.exports = router