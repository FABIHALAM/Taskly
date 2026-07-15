const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')

// Create a new task inside a project
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body
    const { projectId } = req.params

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project: projectId,
    })

    return sendSuccess(res, 201, 'Task created successfully', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Get all tasks for a specific project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    const tasks = await Task.find({
      project: projectId,
      isArchived: false,
    }).sort({ createdAt: -1 })

    return sendSuccess(res, 200, 'Tasks fetched successfully', tasks)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Update a task's status (for drag-and-drop later, or manual change)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    )

    if (!task) {
      return sendError(res, 404, 'Task not found')
    }

    return sendSuccess(res, 200, 'Task status updated', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params
    await Task.findByIdAndUpdate(taskId, { isArchived: true })
    return sendSuccess(res, 200, 'Task deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}
module.exports = { createTask, getTasksByProject, updateTaskStatus, deleteTask }