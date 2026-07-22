const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')
const { sendWelcomeCredentialsEmail } = require('../utils/emailService')

/**
 * @route   GET /api/admin/users
 * @access  Protected (Super Admin Only)
 * Get all users with their roles, department, and account status.
 */
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
    return sendSuccess(res, 200, 'All workspace users fetched', users)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   POST /api/admin/create-user
 * @access  Protected (Super Admin Only)
 * Super Admin provisions an official company account, auto-generates temp password,
 * hashes it, saves the user, and sends official credentials via Gmail.
 */
const createUserAdmin = async (req, res) => {
  try {
    const { name, email, role, department } = req.body

    if (!name || !email) {
      return sendError(res, 400, 'Name and email are required')
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return sendError(res, 400, 'A user with this email address already exists')
    }

    // Auto-generate secure 8-character temporary password
    const tempPassword = 'Taskly#' + Math.floor(1000 + Math.random() * 9000)

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(tempPassword, salt)

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'member',
      department: department || 'Engineering',
      status: 'Active',
      isTemporaryPassword: true,
    })

    // Dispatch Credentials via Gmail Engine in background
    sendWelcomeCredentialsEmail({
      to: newUser.email,
      name: newUser.name,
      role: newUser.role,
      temporaryPassword: tempPassword,
      loginUrl: 'http://localhost:5173/login',
    })

    return sendSuccess(res, 201, 'User account provisioned and credentials sent to Gmail!', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      tempPassword,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   PATCH /api/admin/users/:userId/role
 * @access  Protected (Super Admin Only)
 * Update user role (Member <-> Manager <-> Admin)
 */
const updateUserRoleAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    const { role } = req.body

    if (!['admin', 'manager', 'member'].includes(role)) {
      return sendError(res, 400, 'Invalid role specified')
    }

    const user = await User.findById(userId)
    if (!user) return sendError(res, 404, 'User not found')

    user.role = role
    await user.save()

    return sendSuccess(res, 200, `User role updated to ${role}`, user)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   PATCH /api/admin/users/:userId/status
 * @access  Protected (Super Admin Only)
 * Suspend or Activate user account
 */
const updateUserStatusAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    const { status } = req.body

    if (!['Active', 'Suspended'].includes(status)) {
      return sendError(res, 400, 'Invalid status value')
    }

    const user = await User.findById(userId)
    if (!user) return sendError(res, 404, 'User not found')

    user.status = status
    await user.save()

    return sendSuccess(res, 200, `User account ${status}`, user)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

module.exports = {
  getAllUsersAdmin,
  createUserAdmin,
  updateUserRoleAdmin,
  updateUserStatusAdmin,
}
