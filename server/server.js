const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()
const taskRoutes = require('./routes/taskRoutes')
const activityRoutes = require('./routes/activityRoutes')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/activity', activityRoutes)
// Middleware to parse JSON data from requests
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI) 
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err))

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
  res.send('Hello from Taskly backend!')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})