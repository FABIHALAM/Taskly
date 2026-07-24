const Project = require('../models/project')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')
const logActivity = require('../utils/logActivity')

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isOwner = (project, userId) => {
  if (!project || !project.owner || !userId) return false
  const ownerId = project.owner._id ? project.owner._id : project.owner
  return ownerId.toString() === userId.toString()
}

const isMember = (project, userId) => {
  if (!project || !userId) return false
  if (isOwner(project, userId)) return true
  return project.members.some((m) => {
    if (!m.user) return false
    const memberId = m.user._id ? m.user._id : m.user
    return memberId.toString() === userId.toString()
  })
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * @route   POST /api/projects
 * @access  Protected (manager or admin only)
 * Creates a project and adds the creator as owner in members array.
 */
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body

    // Only managers and admins can create projects
    const creator = await User.findById(req.userId)
    if (!creator || (creator.role !== 'manager' && creator.role !== 'admin')) {
      return sendError(res, 403, 'Only managers can create projects')
    }

    const project = await Project.create({
      name,
      description,
      owner: req.userId,
      members: [{ user: req.userId, role: 'owner' }],
    })

    await logActivity('project_created', req.userId, 'Project', project._id)

    return sendSuccess(res, 201, 'Project created successfully', project)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   GET /api/projects
 * @access  Protected
 * Returns all projects where the logged-in user is owner or member.
 */
const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.userId },
        { 'members.user': req.userId },
      ],
      isArchived: false,
    })
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')
      .sort({ createdAt: -1 })

    return sendSuccess(res, 200, 'Projects fetched successfully', projects)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   GET /api/projects/:id
 * @access  Protected (members only)
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')

    if (!isMember(project, req.userId)) {
      return sendError(res, 403, 'Access denied — you are not a member of this project')
    }

    return sendSuccess(res, 200, 'Project fetched', project)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   PUT /api/projects/:id
 * @access  Protected (owner only)
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (!isOwner(project, req.userId)) {
      return sendError(res, 403, 'Only the project owner can update this project')
    }

    if (name) project.name = name
    if (description !== undefined) project.description = description
    await project.save()

    await logActivity('project_updated', req.userId, 'Project', id)

    return sendSuccess(res, 200, 'Project updated successfully', project)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   POST /api/projects/:id/members
 * @access  Protected (owner only)
 * Adds a member to the project by their email address.
 */
const addMember = async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (!isOwner(project, req.userId)) {
      return sendError(res, 403, 'Only the project owner can add members')
    }

    // Find user to add by email
    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() })
    if (!userToAdd) return sendError(res, 404, `No user found with email: ${email}`)

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    )
    if (alreadyMember) return sendError(res, 400, 'User is already a member of this project')

    project.members.push({ user: userToAdd._id, role: 'member' })
    await project.save()

    await logActivity('member_added', req.userId, 'Project', project._id)

    // Populate and return updated project
    const updated = await Project.findById(id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    return sendSuccess(res, 200, `${userToAdd.name} added to the project`, updated)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Protected (owner only)
 * Removes a member from the project.
 */
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')
    if (!isOwner(project, req.userId)) {
      return sendError(res, 403, 'Only the project owner can remove members')
    }

    // Cannot remove the owner themselves
    if (userId === req.userId) {
      return sendError(res, 400, 'You cannot remove yourself as the owner')
    }

    const beforeLength = project.members.length
    project.members = project.members.filter(
      (m) => m.user.toString() !== userId.toString()
    )

    if (project.members.length === beforeLength) {
      return sendError(res, 404, 'User is not a member of this project')
    }

    await project.save()
    await logActivity('member_removed', req.userId, 'Project', project._id)

    const updated = await Project.findById(id)
      .populate('owner', 'name email role')
      .populate('members.user', 'name email role')

    return sendSuccess(res, 200, 'Member removed successfully', updated)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

/**
 * @route   DELETE /api/projects/:id
 * @access  Protected (owner only)
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findById(id)

    if (!project) return sendError(res, 404, 'Project not found')
    if (!isOwner(project, req.userId)) {
      return sendError(res, 403, 'Only the project owner can delete this project')
    }

    project.isArchived = true
    await project.save()

    await logActivity('project_deleted', req.userId, 'Project', project._id)

    return sendSuccess(res, 200, 'Project deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
  }
}

const Task = require('../models/Task')

/**
 * @route   GET /api/projects/admin/all
 * @access  Admin only
 * Returns all active projects populated with Owner (Manager), Members, and Tasks matrix.
 */
const getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await Project.find({ isArchived: false })
      .populate('owner', 'name email role avatar department')
      .populate('members.user', 'name email role avatar department')
      .lean()

    const projectsWithTasks = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id, isArchived: false })
          .populate('assignee', 'name email role avatar')
          .sort({ createdAt: -1 })
          .lean()

        return {
          ...p,
          tasks: tasks.map((t) => ({
            id: t._id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignee: t.assignee
              ? {
                  id: t.assignee._id,
                  name: t.assignee.name,
                  email: t.assignee.email,
                  role: t.assignee.role,
                  avatar: t.assignee.avatar,
                }
              : null,
            manager: p.owner
              ? {
                  id: p.owner._id,
                  name: p.owner.name,
                  email: p.owner.email,
                }
              : null,
          })),
        }
      })
    )

    return sendSuccess(res, 200, 'All organization projects & task matrix fetched', projectsWithTasks)
  } catch (error) {
    return sendError(res, 500, 'Server error', error.message)
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