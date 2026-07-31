const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const User = require('./models/User')
const Project = require('./models/project')
const Task = require('./models/Task')
const Sprint = require('./models/Sprint')
const AutomationRule = require('./models/AutomationRule')

const seedData = async () => {
  try {
    console.log('Connecting to database...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to database!')

    // Clean existing seed users if they exist to prevent duplicates
    console.log('Cleaning existing demo data...')
    const demoEmails = ['admin@taskly.com', 'manager@taskly.com', 'engineer1@taskly.com', 'engineer2@taskly.com']
    const existingUsers = await User.find({ email: { $in: demoEmails } })
    const userIds = existingUsers.map(u => u._id)

    // Delete tasks, sprints, projects, and rules related to demo users
    await Task.deleteMany({ assignee: { $in: userIds } })
    await Sprint.deleteMany({})
    await AutomationRule.deleteMany({})
    await Project.deleteMany({ owner: { $in: userIds } })
    await User.deleteMany({ email: { $in: demoEmails } })

    console.log('Creating demo users...')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('password123', salt)

    // Create Users
    const admin = await User.create({
      name: 'M.FABIHALAM Khan (Super Admin)',
      email: 'admin@taskly.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Management',
      lastLoginLocation: 'Islamabad, Pakistan',
      latitude: 33.6844,
      longitude: 73.0479,
      lastLoginIp: '39.38.21.58'
    })

    const manager = await User.create({
      name: 'Malik Sab (Project Manager)',
      email: 'manager@taskly.com',
      password: hashedPassword,
      role: 'manager',
      department: 'Engineering',
      lastLoginLocation: 'Lahore, Pakistan',
      latitude: 31.5204,
      longitude: 74.3587,
      lastLoginIp: '182.180.12.92'
    })

    const engineer1 = await User.create({
      name: 'Alice Johnson',
      email: 'engineer1@taskly.com',
      password: hashedPassword,
      role: 'member',
      department: 'Engineering',
      lastLoginLocation: 'Karachi, Pakistan',
      latitude: 24.8607,
      longitude: 67.0011,
      lastLoginIp: '111.68.96.10'
    })

    const engineer2 = await User.create({
      name: 'Bob Smith',
      email: 'engineer2@taskly.com',
      password: hashedPassword,
      role: 'member',
      department: 'QA & Testing',
      lastLoginLocation: 'Peshawar, Pakistan',
      latitude: 34.0151,
      longitude: 71.5249,
      lastLoginIp: '119.160.48.2'
    })

    console.log('Creating demo projects...')
    // Create Project
    const project1 = await Project.create({
      name: 'Taskly Mobile App',
      description: 'Building the next-gen cross-platform React Native task management mobile application with offline support and sync.',
      owner: manager._id,
      members: [
        { user: manager._id, role: 'owner' },
        { user: engineer1._id, role: 'member' },
        { user: engineer2._id, role: 'member' }
      ]
    })

    const project2 = await Project.create({
      name: 'Corporate Dashboard v2',
      description: 'Enterprise data visualization suite with real-time WebSockets tracking and analytics metrics for managers.',
      owner: manager._id,
      members: [
        { user: manager._id, role: 'owner' },
        { user: engineer1._id, role: 'member' }
      ]
    })

    console.log('Creating sprints...')
    // Create Sprints
    const sprint1 = await Sprint.create({
      name: 'Sprint 1: Authentication & Setup',
      goal: 'Complete auth system, setup databases, and configure core API routing structure.',
      project: project1._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Active'
    })

    const sprint2 = await Sprint.create({
      name: 'Sprint 2: UI Design & Integration',
      goal: 'Integrate full Figma designs, design Kanban board interface, and hook stopwatch client APIs.',
      project: project1._id,
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
      status: 'Planned'
    })

    console.log('Creating tasks...')
    // Tasks for Project 1 - Sprint 1
    await Task.create({
      title: 'Setup JSON Web Token Auth API',
      description: 'Implement JWT login, signup, password hashing, and authorization guards middleware on server.',
      project: project1._id,
      sprint: sprint1._id,
      status: 'Done',
      priority: 'High',
      assignee: engineer1._id,
      loggedHours: 12.5
    })

    await Task.create({
      title: 'Design Dashboard Sidebar Layout',
      description: 'Build premium dark/light glassmorphic layout using TailwindCSS, Lucide icons, and responsive frames.',
      project: project1._id,
      sprint: sprint1._id,
      status: 'In Progress',
      priority: 'Medium',
      assignee: engineer1._id,
      loggedHours: 4.2
    })

    await Task.create({
      title: 'Configure MongoDB Database Schemas',
      description: 'Define database schemas for User, Task, Project, Sprint, and Automations collections with Mongoose index options.',
      project: project1._id,
      sprint: sprint1._id,
      status: 'To Do',
      priority: 'High',
      assignee: engineer2._id,
      loggedHours: 0
    })

    // Tasks for Project 1 - Sprint 2
    await Task.create({
      title: 'Integrate Voice Comments Feature',
      description: 'Allow engineers to record voice notes directly in the task details panel using standard browser audio APIs.',
      project: project1._id,
      sprint: sprint2._id,
      status: 'To Do',
      priority: 'Low',
      assignee: engineer1._id,
      loggedHours: 0
    })

    // Backlog tasks (No Sprint assigned)
    await Task.create({
      title: 'Optimize Webpack/Vite build bundle',
      description: 'Configure code-splitting, module cache headers, and reduce vendor bundle sizes.',
      project: project1._id,
      sprint: null,
      status: 'To Do',
      priority: 'Medium',
      assignee: engineer2._id,
      loggedHours: 0
    })

    await Task.create({
      title: 'QA integration testing & security auditing',
      description: 'Conduct SQLi, XSS, and authentication middleware validation sweeps across database integration points.',
      project: project1._id,
      sprint: null,
      status: 'To Do',
      priority: 'High',
      assignee: engineer2._id,
      loggedHours: 0
    })

    console.log('Creating automation rules...')
    // Automation Rules
    await AutomationRule.create({
      title: 'Auto Escalate Overdue Tasks',
      trigger: 'DUE_SOON',
      action: 'AUTO_PRIORITY_HIGH',
      project: project1._id,
      createdBy: manager._id,
      isActive: true,
      description: 'Escalates task priority to High automatically if the deadline is soon.'
    })

    await AutomationRule.create({
      title: 'Notify Manager on Completion',
      trigger: 'STATUS_DONE',
      action: 'NOTIFY_MANAGER',
      project: project1._id,
      createdBy: manager._id,
      isActive: true,
      description: 'Sends real-time system alerts to the manager when any task status becomes Done.'
    })

    console.log('=========================================')
    console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY!')
    console.log('=========================================')
    console.log('Demo Logins (Password for all is: password123):')
    console.log('🔑 Super Admin: admin@taskly.com')
    console.log('🔑 Project Manager: manager@taskly.com')
    console.log('🔑 Execution Engineer 1: engineer1@taskly.com')
    console.log('🔑 Execution Engineer 2: engineer2@taskly.com')
    console.log('=========================================')

    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seedData()
