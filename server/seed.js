/**
 * Seed Script — Taskly
 * ---------------------------------------------------
 * Populates the database with realistic sample data:
 *   - 3 Users  (1 admin + 2 members)
 *   - 3 Projects
 *   - 12 Tasks  (spread across projects, varied statuses/priorities)
 *   - Activity Logs  (auto-generated for each task action)
 *
 * Usage:
 *   node seed.js          → clears DB then inserts fresh data
 *   node seed.js --fresh  → same as above (explicit flag)
 *
 * WARNING: This script drops all existing data before seeding.
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User        = require('./models/User')
const Project     = require('./models/project')
const Task        = require('./models/Task')
const ActivityLog = require('./models/ActivityLog')

// ─── Sample Data ────────────────────────────────────────────────────────────

const USERS = [
  {
    name: 'Alice Johnson',
    email: 'alice@taskly.dev',
    password: 'password123',
    role: 'admin',
  },
  {
    name: 'Bob Smith',
    email: 'bob@taskly.dev',
    password: 'password123',
    role: 'member',
  },
  {
    name: 'Sara Khan',
    email: 'sara@taskly.dev',
    password: 'password123',
    role: 'member',
  },
]

// Projects are defined as functions so they receive real user IDs
const buildProjects = (alice, bob, sara) => [
  {
    name: 'Website Redesign',
    description: 'Complete overhaul of the company marketing site — new branding, improved UX, mobile-first.',
    owner: alice._id,
    members: [alice._id, bob._id, sara._id],
  },
  {
    name: 'Mobile App Launch',
    description: 'iOS and Android app for the customer-facing product. Target launch: Q4.',
    owner: bob._id,
    members: [bob._id, sara._id],
  },
  {
    name: 'API Integration Sprint',
    description: 'Connect internal services to third-party payment and notification providers.',
    owner: sara._id,
    members: [alice._id, sara._id],
  },
]

// Tasks are defined as functions so they receive real project/user IDs
const buildTasks = (alice, bob, sara, websiteProject, mobileProject, apiProject) => [
  // ── Website Redesign ──────────────────────────────
  {
    title: 'Design new homepage mockup',
    description: 'Create Figma designs for the redesigned homepage. Include hero section, features grid, and footer.',
    status: 'Done',
    priority: 'High',
    project: websiteProject._id,
    assignee: sara._id,
    dueDate: new Date('2026-07-10'),
  },
  {
    title: 'Implement responsive navbar',
    description: 'Convert the static navbar to a fully responsive component. Mobile hamburger menu required.',
    status: 'In Progress',
    priority: 'High',
    project: websiteProject._id,
    assignee: bob._id,
    dueDate: new Date('2026-07-20'),
  },
  {
    title: 'Write SEO meta tags for all pages',
    description: 'Add proper title, description, and Open Graph tags to each page.',
    status: 'To Do',
    priority: 'Medium',
    project: websiteProject._id,
    assignee: alice._id,
    dueDate: new Date('2026-07-25'),
  },
  {
    title: 'Optimize images and assets',
    description: 'Convert all PNGs to WebP, lazy-load below-the-fold images, compress JS bundles.',
    status: 'To Do',
    priority: 'Low',
    project: websiteProject._id,
    assignee: bob._id,
    dueDate: new Date('2026-07-30'),
  },

  // ── Mobile App Launch ─────────────────────────────
  {
    title: 'Set up React Native project structure',
    description: 'Initialise RN project, configure ESLint/Prettier, set up folder structure and navigation stack.',
    status: 'Done',
    priority: 'High',
    project: mobileProject._id,
    assignee: bob._id,
    dueDate: new Date('2026-07-05'),
  },
  {
    title: 'Build login and registration screens',
    description: 'Pixel-perfect implementation of the login and register screens from the approved Figma spec.',
    status: 'In Progress',
    priority: 'High',
    project: mobileProject._id,
    assignee: sara._id,
    dueDate: new Date('2026-07-18'),
  },
  {
    title: 'Integrate push notifications',
    description: 'Set up Firebase Cloud Messaging for both iOS and Android. Handle foreground and background states.',
    status: 'To Do',
    priority: 'Medium',
    project: mobileProject._id,
    assignee: bob._id,
    dueDate: new Date('2026-08-01'),
  },
  {
    title: 'Write unit tests for auth flow',
    description: 'Cover login, register, token refresh, and logout with Jest + React Native Testing Library.',
    status: 'To Do',
    priority: 'Medium',
    project: mobileProject._id,
    assignee: sara._id,
    dueDate: new Date('2026-08-10'),
  },

  // ── API Integration Sprint ────────────────────────
  {
    title: 'Integrate Stripe payment gateway',
    description: 'Implement charge creation, webhook handling, and refund endpoints using the Stripe Node SDK.',
    status: 'In Progress',
    priority: 'High',
    project: apiProject._id,
    assignee: alice._id,
    dueDate: new Date('2026-07-22'),
  },
  {
    title: 'Set up SendGrid email service',
    description: 'Configure transactional email templates for welcome, password-reset, and invoice emails.',
    status: 'Done',
    priority: 'Medium',
    project: apiProject._id,
    assignee: sara._id,
    dueDate: new Date('2026-07-08'),
  },
  {
    title: 'Add rate limiting to public endpoints',
    description: 'Use express-rate-limit to cap unauthenticated requests at 100/15 min per IP.',
    status: 'To Do',
    priority: 'Medium',
    project: apiProject._id,
    assignee: alice._id,
    dueDate: new Date('2026-07-28'),
  },
  {
    title: 'Document all API endpoints in Swagger',
    description: 'Ensure every route has JSDoc annotations visible in /api-docs. Include request/response examples.',
    status: 'To Do',
    priority: 'Low',
    project: apiProject._id,
    assignee: alice._id,
    dueDate: new Date('2026-08-05'),
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

const log = (msg) => console.log(`  ${msg}`)

// ─── Main ────────────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('\n🌱 Connected to MongoDB — starting seed...\n')

    // ── 1. Clear existing data ─────────────────────
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      ActivityLog.deleteMany({}),
    ])
    log('🗑️  Cleared existing data')

    // ── 2. Create users ────────────────────────────
    const hashedUsers = await Promise.all(
      USERS.map(async (u) => ({ ...u, password: await hashPassword(u.password) }))
    )
    const [alice, bob, sara] = await User.insertMany(hashedUsers)
    log(`👤 Created 3 users: ${alice.name}, ${bob.name}, ${sara.name}`)

    // ── 3. Create projects ─────────────────────────
    const [websiteProject, mobileProject, apiProject] = await Project.insertMany(
      buildProjects(alice, bob, sara)
    )
    log(`📁 Created 3 projects: "${websiteProject.name}", "${mobileProject.name}", "${apiProject.name}"`)

    // ── 4. Create tasks ────────────────────────────
    const tasks = await Task.insertMany(
      buildTasks(alice, bob, sara, websiteProject, mobileProject, apiProject)
    )
    log(`✅ Created ${tasks.length} tasks across all projects`)

    // ── 5. Create activity logs ────────────────────
    const activityLogs = tasks.map((task) => ({
      action: task.status === 'Done'
        ? 'task_status_changed'
        : 'task_created',
      performedBy: task.assignee,
      targetType: 'Task',
      targetId: task._id,
    }))

    await ActivityLog.insertMany(activityLogs)
    log(`📋 Created ${activityLogs.length} activity log entries`)

    // ── Summary ────────────────────────────────────
    console.log('\n✨ Seed complete! Here is a summary:\n')
    console.log('  Users (password for all: "password123"):')
    console.log(`    Admin  → ${alice.email}`)
    console.log(`    Member → ${bob.email}`)
    console.log(`    Member → ${sara.email}`)
    console.log('\n  Projects:')
    console.log(`    ${websiteProject.name}  (owner: ${alice.name})`)
    console.log(`    ${mobileProject.name}      (owner: ${bob.name})`)
    console.log(`    ${apiProject.name}  (owner: ${sara.name})`)
    console.log(`\n  Tasks: ${tasks.length} total`)
    console.log(`    Done: ${tasks.filter(t => t.status === 'Done').length}`)
    console.log(`    In Progress: ${tasks.filter(t => t.status === 'In Progress').length}`)
    console.log(`    To Do: ${tasks.filter(t => t.status === 'To Do').length}`)
    console.log('\n')

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB\n')
  }
}

seed()
