const Sprint = require('../models/Sprint')
const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')

// Create a new sprint
const createSprint = async (req, res) => {
  try {
    const { name, goal, projectId, startDate, endDate } = req.body

    const sprintData = {
      name,
      goal: goal || '',
      project: projectId,
    }

    if (startDate && startDate.trim()) sprintData.startDate = startDate
    if (endDate && endDate.trim()) sprintData.endDate = endDate

    const sprint = await Sprint.create(sprintData)

    return sendSuccess(res, 201, 'Sprint created successfully', sprint)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Get all sprints for a project
const getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    const sprints = await Sprint.find({ project: projectId }).sort({ createdAt: -1 }).lean()

    const sprintsWithTasks = await Promise.all(
      sprints.map(async (s) => {
        const tasks = await Task.find({ sprint: s._id, isArchived: false })
          .populate('assignee', 'name email avatar')
          .lean()
        return { ...s, tasks }
      })
    )

    // Backlog tasks (tasks in project without sprint)
    const backlogTasks = await Task.find({ project: projectId, sprint: null, isArchived: false })
      .populate('assignee', 'name email avatar')
      .lean()

    return sendSuccess(res, 200, 'Sprints fetched successfully', {
      sprints: sprintsWithTasks,
      backlogTasks,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Start / Update Sprint Status
const updateSprintStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const sprint = await Sprint.findByIdAndUpdate(id, { status }, { new: true })
    if (!sprint) return sendError(res, 404, 'Sprint not found')

    // If completed, move unfinished tasks to Backlog (null sprint)
    if (status === 'Completed') {
      await Task.updateMany(
        { sprint: id, status: { $ne: 'Done' } },
        { sprint: null }
      )
    }

    return sendSuccess(res, 200, `Sprint status updated to ${status}`, sprint)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

// Assign task to sprint or move to backlog
const assignTaskToSprint = async (req, res) => {
  try {
    const { taskId } = req.params
    const { sprintId } = req.body

    const task = await Task.findByIdAndUpdate(
      taskId,
      { sprint: sprintId || null },
      { new: true }
    )

    if (!task) return sendError(res, 404, 'Task not found')

    return sendSuccess(res, 200, 'Task sprint assignment updated', task)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

module.exports = {
  createSprint,
  getSprintsByProject,
  updateSprintStatus,
  assignTaskToSprint,
}
