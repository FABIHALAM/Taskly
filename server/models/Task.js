const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

// Virtual field: isOverdue
// True when dueDate has passed AND task is not yet Done
taskSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'Done') return false
  return new Date() > this.dueDate
})

module.exports = mongoose.model('Task', taskSchema)