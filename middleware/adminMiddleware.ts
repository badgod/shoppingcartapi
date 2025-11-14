import { Response, NextFunction } from 'express'
// Import RequestWithUser มาจากไฟล์เดิมของคุณ
import { RequestWithUser } from './authMiddleware'
import jwt, { JwtPayload } from 'jsonwebtoken'
import connection from '../utils/db'

// Middleware นี้ต้องถูกเรียก *หลัง* authenticateToken เสมอ
async function checkAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        // เรามั่นใจว่า req.user มีข้อมูลจาก token แล้ว
        const userEmail = (req.user as JwtPayload).email

        if (!userEmail) {
            return res.status(403).json({ message: 'Forbidden (No email in token)' })
        }

        // Query ฐานข้อมูลเพื่อเอา role ล่าสุด (ปลอดภัยกว่าการเก็บ role ใน token)
        connection.execute(
            "SELECT role FROM users WHERE email = ?",
            [userEmail],
            function (err, results: any) {
                if (err) {
                    return res.status(500).json({ message: 'Database error', error: err })
                }

                if (results.length === 0) {
                    return res.status(404).json({ message: 'User not found' })
                }

                const userRole = results[0].role

                // ถ้าเป็น admin ให้ผ่านไปทำงานต่อ
                if (userRole === 'admin') {
                    next()
                } else {
                    // ถ้าไม่ใช่ admin (เป็น customer) ให้ปฏิเสธ
                    return res.status(403).json({
                        message: 'Forbidden: Admin access required',
                        status: 403
                    })
                }
            }
        )

    } catch (err) {
        res.status(500).json({ message: 'Server error in admin check' })
    }
}

export default checkAdmin