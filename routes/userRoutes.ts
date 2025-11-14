import express, { Router } from 'express'
// *** แก้ไข: import ฟังก์ชันใหม่เข้ามา ***
import * as userController from '../controllers/userController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware'

// Initialize router
const router: Router = express.Router()

// Admin (checkAdmin)
router.use(authenticateToken)
router.use(checkAdmin)

// Get all users (Admin Only)
// GET /api/users
router.get('/', userController.getAllUsers)

// Get user by id (Admin Only)
// GET /api/users/1
router.get('/:id', userController.getUserById)

// Update user (Admin Only)
// PUT /api/users/1
router.put('/:id', userController.updateUser)

// Delete user (Admin Only)
// DELETE /api/users/1
router.delete('/:id', userController.deleteUser)

export default router