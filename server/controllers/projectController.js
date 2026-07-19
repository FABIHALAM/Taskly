const Project = require('../models/project')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')
const logActivity = require('../utils/logActivity')
const { createNotification } = require('./notificationController')

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const project = await Project.create({
      name,
      description,
      owner: req.userId,
      members: [req.userId],
    })
    return sendSuccess(res, 201, 'Project created successfully', project)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Get all projects where the logged-in user is owner or member
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }],
      isArchived: false,
    }).sort({ createdAt: -1 })
    return sendSuccess(res, 200, 'Projects fetched successfully', projects)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Get a single project by ID (with populated owner and members)
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name email')

    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')

    const isMember =
      project.members.some((m) => m._id.toString() === req.userId) ||
      project.owner._id.toString() === req.userId
    if (!isMember) return sendError(res, 403, 'Access denied')

    return sendSuccess(res, 200, 'Project fetched', project)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Update project name/description (owner only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (project.owner.toString() !== req.userId)
      return sendError(res, 403, 'Only the owner can update this project')

    if (name) project.name = name
    if (description !== undefined) project.description = description
    await project.save()

    await logActivity('project_updated', req.userId, 'Project', id)

    return sendSuccess(res, 200, 'Project updated successfully', project)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Add a member to a project (owner only)
const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (project.owner.toString() !== req.userId)
      return sendError(res, 403, 'Only the owner can add members')

    // Check user exists
    const user = await User.findById(userId)
    if (!user) return sendError(res, 404, 'User not found')

    // Check already a member
    if (project.members.map((m) => m.toString()).includes(userId))
      return sendError(res, 400, 'User is already a member of this project')

    project.members.push(userId)
    await project.save()

    await logActivity('member_added', req.userId, 'Project', id)

    // Notify the new member
    await createNotification(
      'member_added',
      userId,
      'Project',
      id,
      `You have been added to project: "${project.name}"`
    )

    const updated = await Project.findById(id).populate('members', 'name email')
    return sendSuccess(res, 200, 'Member added successfully', updated)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Remove a member from a project (owner only)
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (project.owner.toString() !== req.userId)
      return sendError(res, 403, 'Only the owner can remove members')
    if (project.owner.toString() === userId)
      return sendError(res, 400, 'Cannot remove the project owner')

    project.members = project.members.filter((m) => m.toString() !== userId)
    await project.save()

    await logActivity('member_removed', req.userId, 'Project', id)

    const updated = await Project.findById(id).populate('members', 'name email')
    return sendSuccess(res, 200, 'Member removed successfully', updated)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Soft-delete project (owner only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findById(id)
    if (!project) return sendError(res, 404, 'Project not found')
    if (project.owner.toString() !== req.userId)
      return sendError(res, 403, 'Only the owner can delete this project')

    project.isArchived = true
    await project.save()
    return sendSuccess(res, 200, 'Project deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

// Admin: get all projects
const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: false }).populate('owner', 'name email')
    return sendSuccess(res, 200, 'All projects fetched', projects)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
  getAllProjectsAdmin,
}