import express, { Router } from 'express'
import * as categoryController from '../controllers/categoryController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware'

const router: Router = express.Router()

// --- Customer Routes (ดูได้) ---
router.get('/', authenticateToken, categoryController.getAllCategories)
router.get('/:id', authenticateToken, categoryController.getCategoryById)

// --- Admin Routes (จัดการ) ---
router.post('/', [authenticateToken, checkAdmin], categoryController.createCategory)
router.put('/:id', [authenticateToken, checkAdmin], categoryController.updateCategory)
router.delete('/:id', [authenticateToken, checkAdmin], categoryController.deleteCategory)

export default router