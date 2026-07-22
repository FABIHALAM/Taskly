const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
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
      // admin   → Super Admin (Create Users, Dispatch Credentials, Full Org Control)
      // manager → Project Lead (Create Projects, Add Members, Assign Tasks)
      // member  → Team Engineer (Execute Tasks, Stopwatch, Voice Comments)
      enum: ['admin', 'manager', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    isTemporaryPassword: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)