import express, { Router } from 'express'
import * as productController from '../controllers/productController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware' // <-- 1. Import

// Initialize router
const router: Router = express.Router()

router.get('/', authenticateToken, productController.getAllProducts)

router.get('/:productId', authenticateToken, productController.getProductById)

// --- Admin Only ---
router.post('/', [authenticateToken, checkAdmin], productController.createProduct)

router.put('/:productId', [authenticateToken, checkAdmin], productController.updateProduct)

router.delete('/:productId', [authenticateToken, checkAdmin], productController.deleteProduct)

export default router