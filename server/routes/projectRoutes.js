const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { createProject, getMyProjects, deleteProject } = require('../controllers/projectController')
router.delete('/:id', protect, deleteProject)

router.post('/', protect, createProject)
router.get('/', protect, getMyProjects)

module.exports = router
