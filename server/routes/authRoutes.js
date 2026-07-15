const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { registerUser, loginUser, getMyProfile } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')
const validateRequest = require('../middleware/validateRequest')

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

router.get('/me', protect, getMyProfile)
router.post('/register', registerValidation, validateRequest, registerUser)
router.post('/login', loginValidation, validateRequest, loginUser)

module.exports = router