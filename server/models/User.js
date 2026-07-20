const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    // admin   → system-level superuser (set manually in DB)
    // manager → can create projects, add members, assign tasks
    // member  → can only work on assigned tasks
    enum: ['admin', 'manager', 'member'],
    default: 'member',
  },
  refreshToken: {
    type: String,
    default: null,
  },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)