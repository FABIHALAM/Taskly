const Task = require('../models/Task')
const Project = require('../models/project')
const ActivityLog = require('../models/ActivityLog')
const User = require('../models/User')
const { sendSuccess, sendError } = require('../utils/response')

/**
 * GET /api/analytics/projects/:id
 * Returns a rich analytics report for a single project.
 * Unique feature — no basic Jira clone has this out of the box.
 */
const getProjectStats = async (req, res) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id)
    if (!project || project.isArchived) return sendError(res, 404, 'Project not found')

    // Check access
    const isOwner = project.owner.toString() === req.userId
    const isMember = isOwner || project.members.some(
      (m) => m.user.toString() === req.userId
    )
    if (!isMember) return sendError(res, 403, 'Access denied')

    const tasks = await Task.find({ project: id, isArchived: false })

    const now = new Date()

    // Status breakdown
    const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0 }
    tasks.forEach((t) => { byStatus[t.status] = (byStatus[t.status] || 0) + 1 })

    // Priority breakdown
    const byPriority = { Low: 0, Medium: 0, High: 0 }
    tasks.forEach((t) => { byPriority[t.priority] = (byPriority[t.priority] || 0) + 1 })

    // Overdue count (dueDate passed, not Done)
    const overdueCount = tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'Done'
    ).length

    // Completion rate
    const completionRate =
      tasks.length === 0 ? 0 : Math.round((byStatus['Done'] / tasks.length) * 100)

    // Most active member (most tasks assigned)
    const memberTaskCount = {}
    tasks.forEach((t) => {
      if (t.assignee) {
        const key = t.assignee.toString()
        memberTaskCount[key] = (memberTaskCount[key] || 0) + 1
      }
    })
    let mostActiveMember = null
    if (Object.keys(memberTaskCount).length > 0) {
      const topId = Object.entries(memberTaskCount).sort((a, b) => b[1] - a[1])[0][0]
      const topUser = await User.findById(topId).select('name email')
      mostActiveMember = {
        ...topUser.toObject(),
        taskCount: memberTaskCount[topId],
      }
    }

    // Tasks created in the last 7 days
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const recentTaskCount = tasks.filter((t) => t.createdAt >= sevenDaysAgo).length

    // Average tasks per member
    const memberCount = project.members.length
    const avgTasksPerMember = memberCount > 0 ? (tasks.length / memberCount).toFixed(1) : 0

    return sendSuccess(res, 200, 'Project analytics fetched', {
      projectId: id,
      projectName: project.name,
      totalTasks: tasks.length,
      byStatus,
      byPriority,
      overdueCount,
      completionRate: `${completionRate}%`,
      memberCount,
      avgTasksPerMember: Number(avgTasksPerMember),
      mostActiveMember,
      recentTaskCount,
      summary:
        completionRate === 100
          ? '🎉 All tasks completed!'
          : completionRate >= 50
          ? '🚀 More than halfway there!'
          : '📋 Just getting started',
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

/**
 * GET /api/analytics/dashboard
 * Personal dashboard analytics for the logged-in user.
 * Shows tasks assigned to them across ALL their projects.
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId

    // All projects this user is part of
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
      isArchived: false,
    })
    const projectIds = projects.map((p) => p._id)

    // All tasks assigned to this user
    const myTasks = await Task.find({
      assignee: userId,
      isArchived: false,
    }).populate('project', 'name')

    const now = new Date()
    const overdueTasks = myTasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'Done'
    )

    const dueSoonTasks = myTasks.filter((t) => {
      if (!t.dueDate || t.status === 'Done') return false
      const diff = (t.dueDate - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 3
    })

    const byStatus = { 'To Do': 0, 'In Progress': 0, Done: 0 }
    myTasks.forEach((t) => { byStatus[t.status] = (byStatus[t.status] || 0) + 1 })

    return sendSuccess(res, 200, 'Dashboard analytics fetched', {
      totalProjects: projects.length,
      totalTasksAssigned: myTasks.length,
      byStatus,
      overdueTasks: overdueTasks.map((t) => ({
        id: t._id,
        title: t.title,
        project: t.project?.name,
        projectId: t.project?._id,
        dueDate: t.dueDate,
        priority: t.priority,
      })),
      dueSoonCount: dueSoonTasks.length,
      dueSoonTasks: dueSoonTasks.map((t) => ({
        id: t._id,
        title: t.title,
        project: t.project?.name,
        projectId: t.project?._id,
        dueDate: t.dueDate,
        priority: t.priority,
      })),
    })
  } catch (error) {
    return sendError(res, 500, 'Server error')
  }
}

module.exports = { getProjectStats, getDashboardStats }
