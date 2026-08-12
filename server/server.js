const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const activityRoutes = require('./routes/activityRoutes')
const commentRoutes = require('./routes/commentRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const searchRoutes = require('./routes/searchRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const adminRoutes = require('./routes/adminRoutes')
const sprintRoutes = require('./routes/sprintRoutes')
const automationRoutes = require('./routes/automationRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:');
    const isVercel = origin.endsWith('.vercel.app');
    const isClientUrl = origin === process.env.CLIENT_URL;

    if (isLocalhost || isVercel || isClientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ─── Database ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err))
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/sprints', sprintRoutes)
app.use('/api/automations', automationRoutes)

app.get('/', (req, res) => {
  res.send('Taskly API — visit /api-docs for documentation')
})

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

module.exports = app