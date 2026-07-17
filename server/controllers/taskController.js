const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')
const logActivity = require('../utils/logActivity')

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

    await logActivity('task_created', req.userId, 'Task', task._id)

    return sendSuccess(res, 201, 'Task created successfully', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Get all tasks for a specific project (with pagination, sorting, filtering)
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc', status, priority } = req.query

    const query = { project: projectId, isArchived: false }

    if (status) query.status = status
    if (priority) query.priority = priority

    const sortOrder = order === 'asc' ? 1 : -1

    const tasks = await Task.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const totalTasks = await Task.countDocuments(query)

    return sendSuccess(res, 200, 'Tasks fetched successfully', {
      tasks,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
      },
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Update a task's status
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

    await logActivity('task_status_changed', req.userId, 'Task', taskId)

    return sendSuccess(res, 200, 'Task status updated', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Delete (soft-delete) a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params

    const task = await Task.findByIdAndUpdate(taskId, { isArchived: true })

    if (!task) {
      return sendError(res, 404, 'Task not found')
    }

    await logActivity('task_deleted', req.userId, 'Task', taskId)

    return sendSuccess(res, 200, 'Task deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { createTask, getTasksByProject, updateTaskStatus, deleteTask }