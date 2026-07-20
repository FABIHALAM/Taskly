const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
  getAllProjectsAdmin,
} = require('../controllers/projectController')
const protect = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const validateRequest = require('../middleware/validateRequest')

// Validation
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]

const updateProjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
]

const addMemberValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/', protect, projectValidation, validateRequest, createProject)
router.get('/', protect, getMyProjects)
router.get('/admin/all', protect, requireAdmin, getAllProjectsAdmin)
router.get('/:id', protect, getProjectById)
router.put('/:id', protect, updateProjectValidation, validateRequest, updateProject)
router.delete('/:id', protect, deleteProject)

// Member management (owner only — enforced inside controller)
router.post('/:id/members', protect, addMemberValidation, validateRequest, addMember)
router.delete('/:id/members/:userId', protect, removeMember)

module.exports = router