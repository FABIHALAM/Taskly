const express = require('express')
const router = express.Router()
const { globalSearch } = require('../controllers/searchController')
const protect = require('../middleware/authMiddleware')

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Global search across tasks and projects
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword (min 2 characters)
 *         example: login bug
 *     responses:
 *       200:
 *         description: Unified search results grouped by type
 *       400:
 *         description: Query too short
 */
router.get('/', protect, globalSearch)

module.exports = router
