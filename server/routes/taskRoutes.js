const express = require('express')
const router = express.Router()

const protect = require('../middleware/authMiddleware')
const { createTask, getTasksByProject, updateTaskStatus, deleteTask } = require('../controllers/taskController')

router.delete('/:taskId', protect, deleteTask)
router.post('/:projectId', protect, createTask)
router.get('/:projectId', protect, getTasksByProject)
router.patch('/:taskId/status', protect, updateTaskStatus)

module.exports = router