const mongoose = require('mongoose')

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'member'],
    default: 'member',
  },
}, { _id: false })

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // members array now stores both userId and their project-level role
  members: [memberSchema],
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)