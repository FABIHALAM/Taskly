const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

// ─── Validation Rules ─────────────────────────────────────────────────────────

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // NOTE: role is intentionally NOT validated here — handled safely in controller
]

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
]

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Johnson
 *               email:
 *                 type: string
 *                 example: alice@taskly.dev
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/register', registerValidation, validateRequest, registerUser)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive access + refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: alice@taskly.dev
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful — returns accessToken and refreshToken
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, validateRequest, loginUser)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a new accessToken
 *       403:
 *         description: Invalid or revoked refresh token
 */
router.post('/refresh', refreshValidation, validateRequest, refreshAccessToken)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Not authorized
 */
router.post('/logout', protect, logoutUser)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, getMyProfile)
router.put('/me', protect, updateMyProfile)

module.exports = router