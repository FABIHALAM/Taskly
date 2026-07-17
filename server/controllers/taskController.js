const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')
const logActivity = require('../utils/logActivity')

// Create a new task inside a project
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee } = req.body
    const { projectId } = req.params

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignee: assignee || null,
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
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc', status, priority, search } = req.query

    const query = { project: projectId, isArchived: false }

    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) query.title = { $regex: search, $options: 'i' }

    const sortOrder = order === 'asc' ? 1 : -1

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
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

// Update a task (title, description, priority, dueDate, assignee, status)
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const { title, description, priority, dueDate, assignee, status } = req.body

    const task = await Task.findById(taskId)
    if (!task) return sendError(res, 404, 'Task not found')
    if (task.isArchived) return sendError(res, 400, 'Cannot update an archived task')

    const updatedFields = {}
    if (title !== undefined) updatedFields.title = title
    if (description !== undefined) updatedFields.description = description
    if (priority !== undefined) updatedFields.priority = priority
    if (dueDate !== undefined) updatedFields.dueDate = dueDate
    if (assignee !== undefined) updatedFields.assignee = assignee
    if (status !== undefined) updatedFields.status = status

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updatedFields,
      { new: true, runValidators: true }
    ).populate('assignee', 'name email')

    await logActivity('task_updated', req.userId, 'Task', taskId)

    return sendSuccess(res, 200, 'Task updated successfully', updatedTask)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Update task status only (for Kanban drag-drop)
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    const task = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true }
    )

    if (!task) return sendError(res, 404, 'Task not found')

    await logActivity('task_status_changed', req.userId, 'Task', taskId)

    return sendSuccess(res, 200, 'Task status updated', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Soft-delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params

    const task = await Task.findByIdAndUpdate(taskId, { isArchived: true })
    if (!task) return sendError(res, 404, 'Task not found')

    await logActivity('task_deleted', req.userId, 'Task', taskId)

    return sendSuccess(res, 200, 'Task deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { createTask, getTasksByProject, updateTask, updateTaskStatus, deleteTask }