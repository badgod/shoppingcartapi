import { Response } from "express"
import { RequestWithUser } from "../middleware/authMiddleware"
import pool from "../utils/db"
import { JwtPayload } from "jsonwebtoken"
import { RowDataPacket } from "mysql2/promise"
import bcrypt from "bcrypt"

//----------------------------------------
// Get My Profile (Customer & Admin)
//----------------------------------------
export async function getMyProfile(req: RequestWithUser, res: Response) {
    const token = req.user as JwtPayload
    const userId = token.id

    try {
        const [results] = await pool.execute<RowDataPacket[]>(
            "SELECT id, firstname, lastname, email, address, phone, role, avatar, created_at FROM users WHERE id = ?",
            [userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.json(results[0]);

    } catch (err: any) {
        console.error("Error fetching profile: ", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Update My Profile (Customer & Admin)
//----------------------------------------
export async function updateMyProfile(req: RequestWithUser, res: Response) {
    const token = req.user as JwtPayload
    const userId = token.id
    const { firstname, lastname, address, phone } = req.body;

    // (เราไม่อนุญาตให้แก้ email หรือ role ผ่านหน้านี้)
    if (!firstname || !lastname) {
        return res.status(400).json({ status: "error", message: "Firstname and Lastname are required" });
    }

    try {
        const [results]: any = await pool.execute(
            "UPDATE users SET firstname = ?, lastname = ?, address = ?, phone = ? WHERE id = ?",
            [firstname, lastname, address || null, phone || null, userId]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        res.json({
            status: "ok",
            message: "Profile updated successfully",
            user: { id: userId, firstname, lastname, address, phone }
        });

    } catch (err: any) {
        console.error("Error updating profile: ", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Change Password (Customer & Admin)
//----------------------------------------
export async function changePassword(req: RequestWithUser, res: Response) {
    const token = req.user as JwtPayload
    const userId = token.id
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ status: "error", message: "Old password and new password are required" });
    }

    try {
        // 1. ดึงรหัสผ่านเก่าจาก DB
        const [results] = await pool.execute<RowDataPacket[]>(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const hashedPassword = results[0].password;

        // 2. ตรวจสอบรหัสผ่านเก่า
        const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "Old password is not correct" });
        }

        // 3. Hash รหัสผ่านใหม่
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. อัปเดตรหัสผ่านใหม่ลง DB
        await pool.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [newHashedPassword, userId]
        );

        res.json({ status: "ok", message: "Password changed successfully" });

    } catch (err: any) {
        console.error("Error changing password: ", err);
        res.status(500).json({ status: "error", message: err.message });
    }
}