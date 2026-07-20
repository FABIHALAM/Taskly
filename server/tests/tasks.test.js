require('dotenv').config()
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-jest-only'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-jest-only'

const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../server')

let mongoServer
let accessToken
let projectId
let taskId

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  // Disconnect from any existing connection then use in-memory
  await mongoose.disconnect()
  await mongoose.connect(mongoServer.getUri())

  // Register + login to get token
  await request(app).post('/api/auth/register').send({
    name: 'Test User',
    email: 'testuser@taskly.dev',
    password: 'password123',
    role: 'manager',
  })

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'testuser@taskly.dev',
    password: 'password123',
  })

  accessToken = loginRes.body.data.accessToken
}, 60000)

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

// ─── Projects ─────────────────────────────────────────────────────────────────

describe('Project Endpoints', () => {
  test('should create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Project', description: 'A test project' })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Test Project')
    projectId = res.body.data._id
  })

  test('should get my projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  test('should get single project by id', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data._id).toBe(projectId)
  })

  test('should update a project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Project Name' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.name).toBe('Updated Project Name')
  })

  test('should reject project creation without auth', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'No Auth Project' })

    expect(res.statusCode).toBe(401)
  })
})

// ─── Tasks ────────────────────────────────────────────────────────────────────

describe('Task Endpoints', () => {
  test('should create a task in a project', async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Test Task',
        description: 'A test task',
        priority: 'High',
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.data.title).toBe('Test Task')
    expect(res.body.data.priority).toBe('High')
    taskId = res.body.data._id
  })

  test('should get tasks for a project', async () => {
    const res = await request(app)
      .get(`/api/tasks/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.tasks.length).toBeGreaterThan(0)
    expect(res.body.data.pagination).toBeDefined()
  })

  test('should filter tasks by status', async () => {
    const res = await request(app)
      .get(`/api/tasks/${projectId}?status=To Do`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    res.body.data.tasks.forEach((t) => expect(t.status).toBe('To Do'))
  })

  test('should search tasks by title', async () => {
    const res = await request(app)
      .get(`/api/tasks/${projectId}?search=Test`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data.tasks.length).toBeGreaterThan(0)
  })

  test('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Task Title', priority: 'Low' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.title).toBe('Updated Task Title')
    expect(res.body.data.priority).toBe('Low')
  })

  test('should update task status', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'In Progress' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.status).toBe('In Progress')
  })

  test('should reject task creation with invalid priority', async () => {
    const res = await request(app)
      .post(`/api/tasks/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Bad Task', priority: 'SuperHigh' })

    expect(res.statusCode).toBe(400)
  })

  test('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
  })
})

// ─── Comments ─────────────────────────────────────────────────────────────────

describe('Comment Endpoints', () => {
  let commentId
  let newTaskId

  beforeAll(async () => {
    // Create a fresh task for comment tests
    const res = await request(app)
      .post(`/api/tasks/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Task for Comments' })
    newTaskId = res.body.data._id
  })

  test('should add a comment to a task', async () => {
    const res = await request(app)
      .post(`/api/comments/${newTaskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Great work on this!' })

    expect(res.statusCode).toBe(201)
    expect(res.body.data.text).toBe('Great work on this!')
    commentId = res.body.data._id
  })

  test('should get comments for a task', async () => {
    const res = await request(app)
      .get(`/api/comments/${newTaskId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('should update a comment', async () => {
    const res = await request(app)
      .put(`/api/comments/edit/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Edited comment text' })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.text).toBe('Edited comment text')
  })

  test('should delete a comment', async () => {
    const res = await request(app)
      .delete(`/api/comments/edit/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
  })

  test('should reject empty comment', async () => {
    const res = await request(app)
      .post(`/api/comments/${newTaskId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: '' })

    expect(res.statusCode).toBe(400)
  })
})

// ─── Notifications ────────────────────────────────────────────────────────────

describe('Notification Endpoints', () => {
  test('should get notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.data).toHaveProperty('unreadCount')
    expect(Array.isArray(res.body.data.notifications)).toBe(true)
  })

  test('should mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
  })
})
