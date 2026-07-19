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

// ─── Validation ───────────────────────────────────────────────────────────────
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]
const updateProjectValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
]
const memberValidation = [
  body('userId').notEmpty().withMessage('userId is required'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Website Redesign
 *               description:
 *                 type: string
 *                 example: Complete overhaul of the marketing site
 *     responses:
 *       201:
 *         description: Project created successfully
 *   get:
 *     summary: Get all projects for the logged-in user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.post('/', protect, projectValidation, validateRequest, createProject)
router.get('/', protect, getMyProjects)

// Admin route — must be before /:id
router.get('/admin/all', protect, requireAdmin, getAllProjectsAdmin)

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a single project with members
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details with populated owner and members
 *       403:
 *         description: Access denied
 *   put:
 *     summary: Update project name or description (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Not the owner
 *   delete:
 *     summary: Delete (archive) a project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 */
router.get('/:id', protect, getProjectById)
router.put('/:id', protect, updateProjectValidation, validateRequest, updateProject)
router.delete('/:id', protect, deleteProject)

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: Add a member to a project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 64abc123def456...
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: Already a member
 *       403:
 *         description: Not the owner
 */
router.post('/:id/members', protect, memberValidation, validateRequest, addMember)

/**
 * @swagger
 * /projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a project (owner only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Not the owner
 */
router.delete('/:id/members/:userId', protect, removeMember)

module.exports = router