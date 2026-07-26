const express = require('express')
const router = express.Router()
const {
  createRule,
  getRulesByProject,
  toggleRule,
} = require('../controllers/automationController')
const protect = require('../middleware/authMiddleware')

router.post('/', protect, createRule)
router.get('/project/:projectId', protect, getRulesByProject)
router.patch('/:id/toggle', protect, toggleRule)

module.exports = router
