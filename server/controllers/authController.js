const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return sendError(res, 400, 'User already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return sendSuccess(res, 201, 'User registered successfully', {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    return sendSuccess(res, 200, 'Profile fetched successfully', user)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { registerUser, loginUser, getMyProfile }