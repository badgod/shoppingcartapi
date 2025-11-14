import { Request, Response } from "express"
import connection from "../utils/db"
import { RequestWithUser } from "../middleware/authMiddleware" // <-- 1. Import
import { JwtPayload } from "jsonwebtoken" // <-- 2. Import

//----------------------------------------
// Get all users (Admin Only)
//----------------------------------------
function getAllUsers(req: Request, res: Response) {
    try {
        // เลือกข้อมูลที่จำเป็นเท่านั้น (ไม่ควรส่ง password hash กลับไป)
        connection.execute(
            "SELECT id, firstname, lastname, email, address, phone, role, avatar, created_at FROM users ORDER BY id DESC",
            function (err, results) {
                if (err) {
                    res.json({ status: "error", message: err });
                    return;
                } else {
                    res.json(results);
                }
            }
        );
    } catch (err) {
        console.error("Error querying users: ", err);
        res.sendStatus(500);
    }
}

//----------------------------------------
// Get user by id (Admin Only)
//----------------------------------------
function getUserById(req: Request, res: Response) {
    try {
        connection.execute(
            "SELECT id, firstname, lastname, email, address, phone, role, avatar, created_at FROM users WHERE id = ?",
            [req.params.id],
            function (err, results: any) {
                if (err) {
                    res.json({ status: "error", message: err })
                    return
                } else {
                    res.json(results[0] || {})
                }
            }
        )
    } catch (err) {
        console.error("Error querying user: ", err)
        res.sendStatus(500)
    }
}

//----------------------------------------
// Update user (Admin Only)
//----------------------------------------
function updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { firstname, lastname, email, address, phone, role } = req.body;

    // --- Validation ---
    if (!firstname || !lastname || !email || !role) {
        return res.status(400).json({ status: "error", message: "Missing required fields (firstname, lastname, email, role)" });
    }

    // (เราจะไม่ให้ API นี้อัปเดตรหัสผ่าน เพื่อความปลอดภัย)

    try {
        connection.execute(
            "UPDATE users SET firstname = ?, lastname = ?, email = ?, address = ?, phone = ?, role = ? WHERE id = ?",
            [firstname, lastname, email, address || null, phone || null, role, id],
            function (err, results: any) {
                if (err) {
                    // เช็ค Error ยอดนิยม: Email ซ้ำ
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ status: "error", message: "This email is already in use." });
                    }
                    res.json({ status: "error", message: err.message });
                    return;
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "User not found" });
                }

                res.json({
                    status: "ok",
                    message: "User updated successfully",
                    user: {
                        id: id,
                        firstname,
                        lastname,
                        email,
                        address,
                        phone,
                        role
                    }
                });
            }
        );
    } catch (err) {
        console.error("Error updating user: ", err);
        res.sendStatus(500);
    }
}

//----------------------------------------
// Delete user (Admin Only)
//----------------------------------------
function deleteUser(req: RequestWithUser, res: Response) { // <-- 3. แก้ไขตรงนี้
    const { id: userIdToDelete } = req.params;

    // 4. ดึง ID ของ Admin ที่กำลังล็อกอินอยู่
    const token = req.user as JwtPayload // <-- 5. ไม่ต้อง cast (req as RequestWithUser) แล้ว
    const adminId = token.id

    // 5. ตรวจสอบว่า ID ที่จะลบ ตรงกับ ID ของ admin ที่ล็อกอินหรือไม่
    if (String(adminId) === String(userIdToDelete)) {
        return res.status(403).json({
            status: "error",
            message: "Forbidden: Admin cannot delete their own account."
        });
    }

    try {
        connection.execute(
            "DELETE FROM users WHERE id = ?",
            [userIdToDelete],
            function (err, results: any) {
                if (err) {
                    res.json({ status: "error", message: err.message });
                    return;
                }

                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "User not found" });
                }

                // --- นี่คือจุดที่แก้ไข ---
                res.json({
                    status: "ok",
                    message: "User deleted successfully",
                    userId: userIdToDelete // <-- 6. แก้ไขจาก id เป็น userIdToDelete
                });
            }
        );
    } catch (err) {
        console.error("Error deleting user: ", err);
        res.sendStatus(500);
    }
}

// --- อัปเดตส่วน Export ---
export {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
}