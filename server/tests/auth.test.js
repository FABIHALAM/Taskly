require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const express = require('express')
const authRoutes = require('../routes/authRoutes')

let app
let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

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