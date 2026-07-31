const express = require('express')
const router = express.Router()
const {
  createSprint,
  getSprintsByProject,
  updateSprintStatus,
  assignTaskToSprint,
} = require('../controllers/sprintController')
const protect = require('../middleware/authMiddleware')

router.post('/', protect, createSprint)
router.get('/project/:projectId', protect, getSprintsByProject)
router.patch('/:id/status', protect, updateSprintStatus)
router.patch('/tasks/:taskId/assign', protect, assignTaskToSprint)

module.exports = router
