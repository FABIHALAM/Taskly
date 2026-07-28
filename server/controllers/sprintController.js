const Sprint = require('../models/Sprint')
const Task = require('../models/Task')
const { sendSuccess, sendError } = require('../utils/response')

// Create a new sprint
const createSprint = async (req, res) => {
  try {
    let { name, goal, projectId, startDate, endDate } = req.body

    console.log('=== CREATE SPRINT DEBUG ===')
    console.log('Body received:', { name, goal, projectId, startDate, endDate })
    console.log('User:', req.userId)

    if (!name || !name.trim()) {
      return sendError(res, 400, 'Sprint name is required')
    }

    // Validate projectId — if missing, auto-pick based on role
    const mongoose = require('mongoose')
    if (!projectId || projectId === 'undefined' || projectId === 'null' || String(projectId).trim() === '') {
      const Project = require('../models/project')
      const User = require('../models/User')
      const reqUser = await User.findById(req.userId).select('role').lean()
      const isAdmin = reqUser?.role === 'admin'

      // Admin picks any project in workspace; members pick their own
      const query = isAdmin
        ? {}
        : { $or: [{ owner: req.userId }, { 'members.user': req.userId }] }

      const proj = await Project.findOne(query).lean()
      if (!proj) {
        return sendError(res, 400, 'No project found in workspace. Please create a project first.')
      }
      projectId = proj._id
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return sendError(res, 400, `Invalid project ID: ${projectId}`)
    }

    const sprintData = {
      name: name.trim(),
      goal: goal || '',
      project: projectId,
    }

    if (startDate && String(startDate).trim()) {
      const parsedStart = new Date(startDate)
      if (!isNaN(parsedStart.getTime())) sprintData.startDate = parsedStart
    }
    if (endDate && String(endDate).trim()) {
      const parsedEnd = new Date(endDate)
      if (!isNaN(parsedEnd.getTime())) sprintData.endDate = parsedEnd
    }

    console.log('Creating sprint with data:', sprintData)
    const sprint = await Sprint.create(sprintData)
    console.log('Sprint created successfully:', sprint._id)

    return sendSuccess(res, 201, 'Sprint created successfully', sprint)
  } catch (error) {
    console.error('=== SPRINT CREATION ERROR ===')
    console.error('Name:', error.name)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    return sendError(res, 500, error.message || 'Failed to create sprint')
  }
}

// Get all sprints for a project
const getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const mongoose = require('mongoose')

    if (!projectId || projectId === 'undefined' || projectId === 'null' || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendSuccess(res, 200, 'Sprints fetched successfully', {
        sprints: [],
        backlogTasks: [],
      })
    }

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
    console.error('getSprintsByProject Error:', error)
    return sendSuccess(res, 200, 'Sprints fetched fallback', { sprints: [], backlogTasks: [] })
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
    console.error('updateSprintStatus Error:', error.message)
    return sendError(res, 500, error.message || 'Failed to update sprint status')
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
    console.error('assignTaskToSprint Error:', error.message)
    return sendError(res, 500, error.message || 'Failed to assign task to sprint')
  }
}

module.exports = {
  createSprint,
  getSprintsByProject,
  updateSprintStatus,
  assignTaskToSprint,
}
