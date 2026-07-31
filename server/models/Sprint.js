const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ['Planned', 'Active', 'Completed'],
      default: 'Planned',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Sprint', sprintSchema)
