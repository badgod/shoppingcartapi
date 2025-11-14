import express, { Router } from 'express'
import * as orderController from '../controllers/orderController'
import authenticateToken from '../middleware/authMiddleware'
import checkAdmin from '../middleware/adminMiddleware'

const router: Router = express.Router()

// ทุกเส้นทางต้อง Login
router.use(authenticateToken);

// --- Customer Routes ---
// สร้างออเดอร์ (POST /api/orders)
router.post('/', orderController.createOrder) 

// ดูออเดอร์ (ของตัวเอง) (GET /api/orders/my)
router.get('/my', orderController.getMyOrders)

// --- Admin Routes ---
// ดูออเดอร์ (ทั้งหมด) (GET /api/orders)
router.get('/', checkAdmin, orderController.getAllOrders)

// --- Common Routes (Admin หรือ เจ้าของ) ---
// ดูรายละเอียดออเดอร์ (GET /api/orders/123)
router.get('/:id', orderController.getOrderDetails)

export default router