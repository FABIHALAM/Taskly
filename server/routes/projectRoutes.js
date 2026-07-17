const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { createProject, getMyProjects, deleteProject } = require('../controllers/projectController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
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

/**
 * @swagger
 * /tasks/{projectId}:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *   get:
 *     summary: Get tasks for a project (with pagination, sorting, filtering)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks with pagination metadata
 */


router.delete('/:id', protect, deleteProject)

module.exports = router