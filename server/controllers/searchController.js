const Task = require('../models/Task')
const Project = require('../models/project')
const { sendSuccess, sendError } = require('../utils/response')

/**
 * GET /api/search?q=keyword
 * Global search across all tasks and projects the user has access to.
 * Returns unified results grouped by type.
 */
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2)
      return sendError(res, 400, 'Search query must be at least 2 characters')

    const regex = { $regex: q.trim(), $options: 'i' }

    // Get user's accessible project IDs
    const accessibleProjects = await Project.find({
      $or: [{ owner: req.userId }, { members: req.userId }],
      isArchived: false,
    }).select('_id name')

    const projectIds = accessibleProjects.map((p) => p._id)

    // Search projects by name/description
    const matchedProjects = accessibleProjects.filter(
      (p) => p.name.match(new RegExp(q.trim(), 'i'))
    )

    // Search tasks by title/description within accessible projects
    const matchedTasks = await Task.find({
      project: { $in: projectIds },
      isArchived: false,
      $or: [{ title: regex }, { description: regex }],
    })
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .limit(20)

    return sendSuccess(res, 200, 'Search results', {
      query: q,
      totalResults: matchedProjects.length + matchedTasks.length,
      projects: matchedProjects.map((p) => ({
        id: p._id,
        name: p.name,
        type: 'project',
      })),
      tasks: matchedTasks.map((t) => ({
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        isOverdue: t.isOverdue,
        projectName: t.project?.name,
        assignee: t.assignee,
        type: 'task',
      })),
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { globalSearch }
