import express, { Router } from 'express'
import * as profileController from '../controllers/profileController'
import authenticateToken from '../middleware/authMiddleware'

const router: Router = express.Router()

// ใช้ authenticateToken กับทุกเส้นทางในไฟล์นี้
router.use(authenticateToken);

// GET /api/profile/me (ดูข้อมูลส่วนตัว)
router.get('/me', profileController.getMyProfile)

// PUT /api/profile/me (แก้ไขข้อมูลส่วนตัว)
router.put('/me', profileController.updateMyProfile)

// PUT /api/profile/change-password (เปลี่ยนรหัสผ่าน)
router.put('/change-password', profileController.changePassword)

export default router