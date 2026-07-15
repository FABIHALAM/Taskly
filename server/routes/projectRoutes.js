const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { createProject, getMyProjects, deleteProject } = require('../controllers/projectController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]

router.post('/', protect, projectValidation, validateRequest, createProject)
router.get('/', protect, getMyProjects)
router.delete('/:id', protect, deleteProject)

module.exports = router