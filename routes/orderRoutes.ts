import express, { Router } from 'express'
import * as orderController from '../controllers/orderController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware'

const router: Router = express.Router()

router.use(authenticateToken);

// --- Customer Routes ---
router.post('/', orderController.createOrder) 

router.get('/my', orderController.getMyOrders)

// --- Admin Routes ---
router.get('/', checkAdmin, orderController.getAllOrders)

// --- Common Routes  ---
router.get('/:id', orderController.getOrderDetails)

export default router