const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const {
  getAllUsersAdmin,
  createUserAdmin,
  updateUserRoleAdmin,
  updateUserStatusAdmin,
} = require('../controllers/adminController')

router.use(protect, requireAdmin)

router.get('/users', getAllUsersAdmin)
router.post('/create-user', createUserAdmin)
router.patch('/users/:userId/role', updateUserRoleAdmin)
router.patch('/users/:userId/status', updateUserStatusAdmin)

module.exports = router
