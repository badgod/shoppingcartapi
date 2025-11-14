import express, { Router } from 'express'
import * as productController from '../controllers/productController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware' // <-- 1. Import

// Initialize router
const router: Router = express.Router()

// Get all products (ลูกค้าดูได้)
router.get('/', authenticateToken, productController.getAllProducts)

// Get product by id (ลูกค้าดูได้)
router.get('/:productId', authenticateToken, productController.getProductById)

// --- Admin Only ---

// Create product (Admin เท่านั้น)
router.post('/', [authenticateToken, checkAdmin], productController.createProduct)

// Update product (Admin เท่านั้น)
router.put('/:productId', [authenticateToken, checkAdmin], productController.updateProduct)

// Delete product (Admin เท่านั้น)
router.delete('/:productId', [authenticateToken, checkAdmin], productController.deleteProduct)

export default router