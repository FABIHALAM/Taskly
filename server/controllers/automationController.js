const AutomationRule = require('../models/AutomationRule')
const Task = require('../models/Task')
const Project = require('../models/project')
const Notification = require('../models/Notification')
const { sendSuccess, sendError } = require('../utils/response')

// Create automation rule
const createRule = async (req, res) => {
  try {
    const { title, projectId, trigger, action } = req.body

    const rule = await AutomationRule.create({
      title,
      project: projectId,
      trigger,
      action,
      createdBy: req.userId,
    })

    return sendSuccess(res, 201, 'Automation rule created', rule)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Get all rules for a project
const getRulesByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const rules = await AutomationRule.find({ project: projectId }).sort({ createdAt: -1 })
    return sendSuccess(res, 200, 'Automation rules fetched', rules)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Toggle rule active status
const toggleRule = async (req, res) => {
  try {
    const { id } = req.params
    const rule = await AutomationRule.findById(id)
    if (!rule) return sendError(res, 404, 'Rule not found')

    rule.isActive = !rule.isActive
    await rule.save()

    return sendSuccess(res, 200, `Automation rule ${rule.isActive ? 'activated' : 'deactivated'}`, rule)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Helper: Engine to evaluate and execute automation rules on task updates
const executeAutomationRules = async (taskId, eventTrigger) => {
  try {
    const task = await Task.findById(taskId).populate('project')
    if (!task) return

    const rules = await AutomationRule.find({
      project: task.project._id,
      trigger: eventTrigger,
      isActive: true,
    })

    for (const rule of rules) {
      if (rule.action === 'AUTO_PRIORITY_HIGH') {
        task.priority = 'High'
        await task.save()
      } else if (rule.action === 'NOTIFY_MANAGER') {
        if (task.project?.owner) {
          await Notification.create({
            recipient: task.project.owner,
            type: 'task_updated',
            message: `🤖 Automation Triggered: Task "${task.title}" updated (${eventTrigger})`,
            targetType: 'Task',
            targetId: task._id,
          })
        }
      } else if (rule.action === 'AUTO_ASSIGN_OWNER') {
        if (task.project?.owner) {
          task.assignee = task.project.owner
          await task.save()
        }
      }

      rule.executionCount += 1
      await rule.save()
    }
  } catch (err) {
    console.error('Automation Rule Execution Error:', err.message)
  }
}

module.exports = {
  createRule,
  getRulesByProject,
  toggleRule,
  executeAutomationRules,
}
