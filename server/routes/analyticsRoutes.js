const express = require('express')
const router = express.Router()
const { getProjectStats, getDashboardStats } = require('../controllers/analyticsController')
const protect = require('../middleware/authMiddleware')

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Personal dashboard analytics for the logged-in user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns total projects, assigned tasks, overdue/due-soon alerts
 */
router.get('/dashboard', protect, getDashboardStats)

/**
 * @swagger
 * /analytics/projects/{id}:
 *   get:
 *     summary: Full analytics report for a specific project
 *     tags: [Analytics]
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
 *         description: Task counts by status/priority, completion rate, most active member
 *       403:
 *         description: Access denied
 */
router.get('/projects/:id', protect, getProjectStats)

module.exports = router
