import express, { Router } from 'express'
import * as profileController from '../controllers/profileController'
import authenticateToken from '../middleware/authMiddleware'

const router: Router = express.Router()

router.use(authenticateToken);

// GET /api/profile/me
router.get('/me', profileController.getMyProfile)

// PUT /api/profile/me
router.put('/me', profileController.updateMyProfile)

// PUT /api/profile/change-password 
router.put('/change-password', profileController.changePassword)

export default router