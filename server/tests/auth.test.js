require('dotenv').config()
// Ensure required env vars exist for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-jest-only'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-for-jest-only'

const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const express = require('express')
const authRoutes = require('../routes/authRoutes')

process.env.MONGOMS_SEARCH_TIMEOUT = '60000'
process.env.MONGOMS_DOWNLOAD_TIMEOUT = '60000'

jest.setTimeout(60000)

let app
let mongoServer

beforeAll(async () => {
  await mongoose.disconnect()
  try {
    mongoServer = await MongoMemoryServer.create({ instance: { launchTimeoutMS: 60000 } })
    await mongoose.connect(mongoServer.getUri())
  } catch (err) {
    console.warn('⚠️ MongoMemoryServer startup fallback to MONGO_URI:', err.message)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.01:27017/taskly_test')
  }

  app = express()
  app.use(express.json())
  app.use('/api/auth', authRoutes)
}, 60000)

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

describe('Auth Endpoints', () => {
  test('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test1234',
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.email).toBe('test@example.com')
  })

  test('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'test1234',
      })

    expect(res.statusCode).toBe(400)
    expect(res.body.success).toBe(false)
  })

  test('should reject registration with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test2@example.com',
        password: '123',
      })

    expect(res.statusCode).toBe(400)
  })

  test('should login with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Test',
      email: 'logintest@example.com',
      password: 'test1234',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'test1234',
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()
  })

  test('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'wrongpassword',
      })

    expect(res.statusCode).toBe(400)
  })
})