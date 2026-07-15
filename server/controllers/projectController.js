const Project = require('../models/Project')
const { sendSuccess, sendError } = require('../utils/response')

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body

    const project = await Project.create({
      name,
      description,
      owner: req.userId,       // logged-in user hi owner banega
      members: [req.userId],   // owner khud-ba-khud pehla member bhi hoga
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
      $or: [
        { owner: req.userId },
        { members: req.userId },
      ],
      isArchived: false,   // archived projects list mein nahi dikhenge
    }).sort({ createdAt: -1 })

    return sendSuccess(res, 200, 'Projects fetched successfully', projects)
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findById(id)

    if (!project) {
      return sendError(res, 404, 'Project not found')
    }
    if (project.owner.toString() !== req.userId) {
      return sendError(res, 403, 'Only the owner can delete this project')
    }

    project.isArchived = true
    await project.save()

    return sendSuccess(res, 200, 'Project deleted successfully')
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { createProject, getMyProjects, deleteProject }