import express, { Router } from 'express'
import * as productStatusController from '../controllers/productStatusController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware'

const router: Router = express.Router()

// --- Customer Routes ---
router.get('/', authenticateToken, productStatusController.getAllStatuses)
router.get('/:id', authenticateToken, productStatusController.getStatusById)

// --- Admin Routes ---
router.post('/', [authenticateToken, checkAdmin], productStatusController.createStatus)
router.put('/:id', [authenticateToken, checkAdmin], productStatusController.updateStatus)
router.delete('/:id', [authenticateToken, checkAdmin], productStatusController.deleteStatus)

export default router