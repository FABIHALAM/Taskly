const mongoose = require('mongoose')

const automationRuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    trigger: {
      type: String,
      enum: ['STATUS_DONE', 'DUE_SOON', 'PRIORITY_HIGH', 'TASK_CREATED'],
      required: true,
    },
    action: {
      type: String,
      enum: ['AUTO_PRIORITY_HIGH', 'NOTIFY_MANAGER', 'AUTO_ASSIGN_OWNER', 'EMAIL_ALERT'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('AutomationRule', automationRuleSchema)
