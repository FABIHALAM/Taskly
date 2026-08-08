/**
 * Seed Script — MEPCO Multan Workspace Portal
 * ---------------------------------------------------
 * Populates the database with realistic sample data customized for
 * MEPCO Multan (Multan Electric Power Company) IT & Operations.
 *
 * Usage:
 *   node seed.js          → clears DB then inserts fresh data
 *
 * WARNING: This script drops all existing data before seeding.
 */

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const User        = require('./models/User')
const Project     = require('./models/project')
const Task        = require('./models/Task')
const ActivityLog = require('./models/ActivityLog')

// ─── MEPCO Custom Sample Data ────────────────────────────────────────────────

const USERS = [
  {
    name: 'MEPCO Super Admin',
    email: 'admin@mepco.com',
    password: 'password123',
    role: 'admin',
    department: 'IT & Security Board (HQ)',
  },
  {
    name: 'Engr. Asif Mahmood',
    email: 'asif@mepco.com',
    password: 'password123',
    role: 'manager',
    department: 'Grid Operations & Automation',
  },
  {
    name: 'Engr. Fariha Alam',
    email: 'fariha@mepco.com',
    password: 'password123',
    role: 'member',
    department: 'Software Engineering & ERP',
  },
  {
    name: 'Yasir Shah',
    email: 'yasir@mepco.com',
    password: 'password123',
    role: 'member',
    department: 'Sub-Divisional Operations & Billing',
  },
]

// Projects representing MEPCO systems
const buildProjects = (asif, fariha, yasir) => [
  {
    name: 'Billing & ERP Integration',
    description: 'Sync local subdivision bill generation engines with central MEPCO Oracle ERP database.',
    owner: asif._id,
    members: [
      { user: asif._id, role: 'owner' },
      { user: fariha._id, role: 'member' },
      { user: yasir._id, role: 'member' }
    ],
  },
  {
    name: 'Smart Meter Telemetry Portal',
    description: 'Deploy real-time API endpoints and dashboards to capture telemetry data from 10,000 smart meters in Multan Cantt division.',
    owner: fariha._id,
    members: [
      { user: fariha._id, role: 'owner' },
      { user: yasir._id, role: 'member' }
    ],
  },
  {
    name: 'Grid Operations & O&M Hub',
    description: 'Track regional grid station feeder shutdowns, maintenance tickets, and load-shedding schedules.',
    owner: yasir._id,
    members: [
      { user: yasir._id, role: 'owner' },
      { user: asif._id, role: 'member' }
    ],
  },
]

// Tasks representing MEPCO operations
const buildTasks = (asif, fariha, yasir, billingProject, smartMeterProject, gridProject) => [
  // ── Billing & ERP Integration ─────────────────────
  {
    title: 'Design customer billing tariff calculation scripts',
    description: 'Create Mongoose/JavaScript scripts to calculate domestic/commercial tariffs based on NEPRA rules.',
    status: 'Done',
    priority: 'High',
    project: billingProject._id,
    assignee: yasir._id,
    dueDate: new Date('2026-08-15'),
  },
  {
    title: 'Sync local subdivision bill engines',
    description: 'Write REST endpoints to post monthly load statistics from local sub-divisions to main headquarters.',
    status: 'In Progress',
    priority: 'High',
    project: billingProject._id,
    assignee: fariha._id,
    dueDate: new Date('2026-08-22'),
  },
  {
    title: 'Write SEO meta tags for portal documentation',
    description: 'Create proper internal portal tags and description for local engineers documentation.',
    status: 'To Do',
    priority: 'Medium',
    project: billingProject._id,
    assignee: asif._id,
    dueDate: new Date('2026-08-28'),
  },
  {
    title: 'Optimize billing records load speed',
    description: 'Create indices on billings database schemas for fast retrieval of client bill history.',
    status: 'To Do',
    priority: 'Low',
    project: billingProject._id,
    assignee: fariha._id,
    dueDate: new Date('2026-09-02'),
  },

  // ── Smart Meter Telemetry Portal ──────────────────
  {
    title: 'Deploy smart meter reading transmission endpoints',
    description: 'Establish secure backend API router to parse incoming TCP streams from grid smart meters.',
    status: 'Done',
    priority: 'High',
    project: smartMeterProject._id,
    assignee: fariha._id,
    dueDate: new Date('2026-08-12'),
  },
  {
    title: 'Build login and registration screens',
    description: 'Pixel-perfect implementation of the login and register screens from the approved MEPCO Figma spec.',
    status: 'In Progress',
    priority: 'High',
    project: smartMeterProject._id,
    assignee: yasir._id,
    dueDate: new Date('2026-08-20'),
  },
  {
    title: 'Integrate push notifications for power breakdown alerts',
    description: 'Configure automated SMS/Push notification alerts for target consumer zones during maintenance.',
    status: 'To Do',
    priority: 'Medium',
    project: smartMeterProject._id,
    assignee: fariha._id,
    dueDate: new Date('2026-09-05'),
  },
  {
    title: 'Write unit tests for telemetry payloads',
    description: 'Verify packet data integrity validation functions using Jest unit test cases.',
    status: 'To Do',
    priority: 'Medium',
    project: smartMeterProject._id,
    assignee: yasir._id,
    dueDate: new Date('2026-09-12'),
  },

  // ── Grid Operations & O&M Hub ─────────────────────
  {
    title: 'Resolve Multan grid feeder telemetry database sync delay',
    description: 'Optimize database logs for grid station feeder loads to prevent latency spikes in live dashboard.',
    status: 'In Progress',
    priority: 'High',
    project: gridProject._id,
    assignee: asif._id,
    dueDate: new Date('2026-08-25'),
  },
  {
    title: 'Configure automated email reporting for feeders load',
    description: 'Write daily schedule triggers to compile grid station outages and dispatch records to board directors.',
    status: 'Done',
    priority: 'Medium',
    project: gridProject._id,
    assignee: yasir._id,
    dueDate: new Date('2026-08-14'),
  },
  {
    title: 'Add rate limiting to public telemetry endpoints',
    description: 'Protect smart meter APIs from overload using rate-limiter rules.',
    status: 'To Do',
    priority: 'Medium',
    project: gridProject._id,
    assignee: asif._id,
    dueDate: new Date('2026-08-30'),
  },
  {
    title: 'Document all grid endpoints in Swagger',
    description: 'Add JSDoc documentation mapping for all grid operations endpoints.',
    status: 'To Do',
    priority: 'Low',
    project: gridProject._id,
    assignee: asif._id,
    dueDate: new Date('2026-09-08'),
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
    console.log('\n🌱 Connected to MongoDB — starting MEPCO seed...\n')

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
    const [adminUser, asif, fariha, yasir] = await User.insertMany(hashedUsers)
    log(`👤 Created 4 users: ${adminUser.name}, ${asif.name}, ${fariha.name}, ${yasir.name}`)

    // ── 3. Create projects ─────────────────────────
    const [billingProject, smartMeterProject, gridProject] = await Project.insertMany(
      buildProjects(asif, fariha, yasir)
    )
    log(`📁 Created 3 projects: "${billingProject.name}", "${smartMeterProject.name}", "${gridProject.name}"`)

    // ── 4. Create tasks ────────────────────────────
    const tasks = await Task.insertMany(
      buildTasks(asif, fariha, yasir, billingProject, smartMeterProject, gridProject)
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
    console.log('\n✨ MEPCO Seed complete! Here is a summary:\n')
    console.log('  Users (password for all: "password123"):')
    console.log(`    Super Admin → ${adminUser.email}`)
    console.log(`    Manager     → ${asif.email}`)
    console.log(`    Member      → ${fariha.email}`)
    console.log(`    Member      → ${yasir.email}`)
    console.log('\n  Projects:')
    console.log(`    ${billingProject.name}  (owner: ${asif.name})`)
    console.log(`    ${smartMeterProject.name}      (owner: ${fariha.name})`)
    console.log(`    ${gridProject.name}  (owner: ${yasir.name})`)
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
