import { Response, NextFunction } from 'express'
import { RequestWithUser } from './authMiddleware'
import { JwtPayload } from 'jsonwebtoken'
import pool from '../utils/db' 
import { RowDataPacket } from "mysql2/promise" 

async function checkAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const userEmail = (req.user as JwtPayload).email

        if (!userEmail) {
            return res.status(403).json({ message: 'Forbidden (No email in token)' })
        }

        const [results] = await pool.execute<RowDataPacket[]>(
            "SELECT role FROM users WHERE email = ?",
            [userEmail]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        const userRole = results[0].role

        if (userRole === 'admin') {
            next()
        } else {
            return res.status(403).json({
                message: 'Forbidden: Admin access required',
                status: 403
            })
        }

    } catch (err: any) { 
        console.error("Error in checkAdmin middleware: ", err);
        res.status(500).json({ message: 'Server error in admin check' })
    }
}

export default checkAdmin