const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a short-lived access token (15 min).
 * Sent in the response body — stored in memory on the client.
 */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })

/**
 * Generates a long-lived refresh token (7 days).
 * Stored in the DB so it can be invalidated on logout.
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return sendError(res, 400, 'User already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({ name, email, password: hashedPassword })

    return sendSuccess(res, 201, 'User registered successfully', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   POST /api/auth/login
 * @access  Public
 * Issues both an access token (short-lived) and a refresh token (long-lived).
 * The refresh token is persisted to the DB so it can be revoked on logout.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return sendError(res, 400, 'Invalid email or password')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return sendError(res, 400, 'Invalid email or password')
    }

    const accessToken  = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Persist the refresh token in the DB (allows server-side revocation)
    user.refreshToken = refreshToken
    await user.save()

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   POST /api/auth/refresh
 * @access  Public (requires valid refresh token in body)
 * Validates the refresh token against the one stored in DB,
 * then issues a fresh access token.
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return sendError(res, 401, 'Refresh token is required')
    }

    // Verify the token signature and expiry
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch {
      return sendError(res, 403, 'Invalid or expired refresh token')
    }

    // Make sure the token matches what is stored in the DB
    // (if the user has logged out, the stored token will be null)
    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, 403, 'Refresh token has been revoked')
    }

    const newAccessToken = generateAccessToken(user._id)

    return sendSuccess(res, 200, 'Access token refreshed', {
      accessToken: newAccessToken,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   POST /api/auth/logout
 * @access  Protected
 * Invalidates the refresh token by clearing it from the DB.
 * After this, /refresh will reject the old token.
 */
const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null })
    return sendSuccess(res, 200, 'Logged out successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken')
    if (!user) return sendError(res, 404, 'User not found')
    return sendSuccess(res, 200, 'Profile fetched', user)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMyProfile,
}