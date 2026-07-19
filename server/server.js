const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const activityRoutes = require('./routes/activityRoutes')
const commentRoutes = require('./routes/commentRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/comments', commentRoutes)

app.get('/', (req, res) => {
  res.send('Taskly API — visit /api-docs for documentation')
})

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

module.exports = app