const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { createProject, getMyProjects, getProjectById, updateProject, deleteProject, getAllProjectsAdmin } = require('../controllers/projectController')
const protect = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const validateRequest = require('../middleware/validateRequest')

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]

const updateProjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
]

router.post('/', protect, projectValidation, validateRequest, createProject)
router.get('/', protect, getMyProjects)
router.get('/admin/all', protect, requireAdmin, getAllProjectsAdmin)
router.get('/:id', protect, getProjectById)
router.put('/:id', protect, updateProjectValidation, validateRequest, updateProject)
router.delete('/:id', protect, deleteProject)

module.exports = router