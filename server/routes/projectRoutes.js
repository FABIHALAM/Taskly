const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { createProject, getMyProjects, deleteProject, getAllProjectsAdmin } = require('../controllers/projectController')
const protect = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const validateRequest = require('../middleware/validateRequest')

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]

router.post('/', protect, projectValidation, validateRequest, createProject)
router.get('/', protect, getMyProjects)
router.delete('/:id', protect, deleteProject)
router.get('/admin/all', protect, requireAdmin, getAllProjectsAdmin)

module.exports = router