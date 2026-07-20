const Task = require('../models/Task')
const Project = require('../models/project')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')
const logActivity = require('../utils/logActivity')
const { createNotification } = require('./notificationController')
const { sendTaskAssignedEmail } = require('../utils/emailService')

// Helper to trigger email notification in background without blocking response
const triggerTaskAssignedEmail = async (managerUserId, assigneeUserId, taskTitle, projectId, priority, dueDate, taskId) => {
  try {
    const [manager, assigneeUser, project] = await Promise.all([
      User.findById(managerUserId).select('name'),
      User.findById(assigneeUserId).select('name email'),
      Project.findById(projectId).select('name'),
    ])

    if (assigneeUser && assigneeUser.email) {
      await sendTaskAssignedEmail({
        to: assigneeUser.email,
        assigneeName: assigneeUser.name,
        managerName: manager?.name || 'Project Manager',
        taskTitle,
        projectName: project?.name || 'Project',
        priority: priority || 'Medium',
        dueDate,
        taskUrl: `http://localhost:5173/projects/${projectId}/tasks/${taskId}`,
      })
    }
  } catch (err) {
    console.error('Task email notification error:', err.message)
  }
}

// Create a new task inside a project
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee, tags, subtasks, estimatedHours, loggedHours } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (project.owner.toString() !== req.userId) {
      return sendError(res, 403, 'Only the project manager can create tasks')
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignee: assignee || null,
      project: projectId,
      tags: tags || [],
      subtasks: subtasks || [],
      estimatedHours: Number(estimatedHours) || 0,
      loggedHours: Number(loggedHours) || 0,
    })

    await logActivity('task_created', req.userId, 'Task', task._id)

    if (assignee && assignee.toString() !== req.userId) {
      await createNotification(
        'task_assigned',
        assignee,
        'Task',
        task._id,
        `You have been assigned a new task: "${title}"`
      )
      triggerTaskAssignedEmail(req.userId, assignee, title, projectId, priority, dueDate, task._id)
    }

    return sendSuccess(res, 201, 'Task created successfully', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Get all tasks for a specific project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
      status,
      priority,
      search,
    } = req.query

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

// Update task details
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const { title, description, priority, dueDate, assignee, status, tags, subtasks, estimatedHours, loggedHours } = req.body

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
    if (tags !== undefined) updatedFields.tags = tags
    if (subtasks !== undefined) updatedFields.subtasks = subtasks
    if (estimatedHours !== undefined) updatedFields.estimatedHours = Number(estimatedHours)
    if (loggedHours !== undefined) updatedFields.loggedHours = Number(loggedHours)

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatedFields, {
      new: true,
      runValidators: true,
    }).populate('assignee', 'name email')

    await logActivity('task_updated', req.userId, 'Task', taskId)

    if (assignee && assignee.toString() !== req.userId) {
      await createNotification(
        'task_assigned',
        assignee,
        'Task',
        taskId,
        `You have been assigned a task: "${updatedTask.title}"`
      )
      triggerTaskAssignedEmail(req.userId, assignee, updatedTask.title, updatedTask.project, updatedTask.priority, updatedTask.dueDate, taskId)
    }

    return sendSuccess(res, 200, 'Task updated successfully', updatedTask)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Toggle subtask status
const toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params
    const task = await Task.findById(taskId)
    if (!task || task.isArchived) return sendError(res, 404, 'Task not found')

    const subtask = task.subtasks.id(subtaskId)
    if (!subtask) return sendError(res, 404, 'Subtask not found')

    subtask.isCompleted = !subtask.isCompleted
    await task.save()

    return sendSuccess(res, 200, 'Subtask updated', task)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Smart AI Subtask Generator
const generateAiSubtasks = async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title) return sendError(res, 400, 'Task title is required for AI generation')

    const text = (title + ' ' + (description || '')).toLowerCase()
    let suggestedSubtasks = []
    let estimatedHours = 8
    let suggestedTags = ['Feature']

    if (text.includes('auth') || text.includes('login') || text.includes('user')) {
      suggestedSubtasks = [
        'Setup database user schema & validation',
        'Create authentication API controller & JWT tokens',
        'Build responsive frontend form & validation state',
        'Write unit tests for sign-in & session flows',
      ]
      estimatedHours = 12
      suggestedTags = ['Auth', 'Backend', 'Security']
    } else if (text.includes('ui') || text.includes('design') || text.includes('frontend')) {
      suggestedSubtasks = [
        'Design responsive layout mockups in Figma',
        'Implement component hierarchy & design tokens',
        'Add smooth transitions & dark mode theme styles',
        'Conduct cross-browser UI verification',
      ]
      estimatedHours = 10
      suggestedTags = ['UI/UX', 'Frontend', 'Design']
    } else if (text.includes('api') || text.includes('backend') || text.includes('database')) {
      suggestedSubtasks = [
        'Define Mongoose schema & index configuration',
        'Implement REST API routes & validator middleware',
        'Configure database connection pooling & error handling',
        'Verify response performance & payload schemas',
      ]
      estimatedHours = 14
      suggestedTags = ['Backend', 'Database', 'API']
    } else if (text.includes('bug') || text.includes('fix') || text.includes('issue')) {
      suggestedSubtasks = [
        'Reproduce reported issue & inspect error stack trace',
        'Implement targeted patch fix in core module',
        'Add regression test case to prevent recurrence',
      ]
      estimatedHours = 6
      suggestedTags = ['Bug', 'Hotfix']
    } else {
      suggestedSubtasks = [
        'Gather technical requirements & document specifications',
        'Implement core functional changes & dependencies',
        'Perform integration testing & code review',
        'Deploy update & verify staging environment',
      ]
      estimatedHours = 8
      suggestedTags = ['Task', 'Engineering']
    }

    return sendSuccess(res, 200, 'AI subtasks generated successfully', {
      subtasks: suggestedSubtasks,
      estimatedHours,
      suggestedTags,
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Update task status only
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params
    const { status } = req.body

    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true })
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

module.exports = {
  createTask,
  getTasksByProject,
  updateTask,
  toggleSubtask,
  generateAiSubtasks,
  updateTaskStatus,
  deleteTask,
}