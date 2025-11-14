import { Response, NextFunction } from 'express'
import { RequestWithUser } from './authMiddleware'
import { JwtPayload } from 'jsonwebtoken'
import pool from '../utils/db' // <-- 1. เปลี่ยน connection เป็น pool
import { RowDataPacket } from "mysql2/promise" // <-- 2. Import Type ช่วย

// 3. เปลี่ยนฟังก์ชันเป็น async
async function checkAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const userEmail = (req.user as JwtPayload).email

        if (!userEmail) {
            return res.status(403).json({ message: 'Forbidden (No email in token)' })
        }

        // 4. ใช้ await pool.execute
        const [results] = await pool.execute<RowDataPacket[]>(
            "SELECT role FROM users WHERE email = ?",
            [userEmail]
        );

        // 5. จัดการผลลัพธ์ (ไม่ต้องใช้ Callback)
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userRole = results[0].role

        // ถ้าเป็น admin ให้ผ่าน
        if (userRole === 'admin') {
            next()
        } else {
            // ถ้าไม่ใช่ admin ให้ปฏิเสธ
            return res.status(403).json({
                message: 'Forbidden: Admin access required',
                status: 403
            })
        }

    } catch (err: any) { // 6. ดักจับ Error ทั้งหมด
        console.error("Error in checkAdmin middleware: ", err);
        res.status(500).json({ message: 'Server error in admin check' })
    }
}

export default checkAdmin