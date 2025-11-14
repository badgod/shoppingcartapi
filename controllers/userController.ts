import { Request, Response } from "express"
import pool from "../utils/db" 
import { RequestWithUser } from "../middleware/authMiddleware"
import { JwtPayload } from "jsonwebtoken"
import { RowDataPacket } from "mysql2" 

//----------------------------------------
// Get all users (Admin Only)
//----------------------------------------
export async function getAllUsers(req: Request, res: Response) {
  try {
    const [results] = await pool.execute(
      "SELECT id, firstname, lastname, email, address, phone, role, avatar, created_at FROM users ORDER BY id DESC"
    );
    res.json(results);
  } catch (err: any) {
    console.error("Error querying users: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Get user by id (Admin Only)
//----------------------------------------
export async function getUserById(req: Request, res: Response) {
  try {
    const [results] = await pool.execute<RowDataPacket[]>(
      "SELECT id, firstname, lastname, email, address, phone, role, avatar, created_at FROM users WHERE id = ?",
      [req.params.id]
    );
    res.json(results[0] || {});
  } catch (err: any) {
    console.error("Error querying user: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Update user (Admin Only)
//----------------------------------------
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { firstname, lastname, email, address, phone, role } = req.body;

  if (!firstname || !lastname || !email || !role) {
    return res.status(400).json({ status: "error", message: "Missing required fields (firstname, lastname, email, role)" });
  }

  try {
    const [results]: any = await pool.execute(
      "UPDATE users SET firstname = ?, lastname = ?, email = ?, address = ?, phone = ?, role = ? WHERE id = ?",
      [firstname, lastname, email, address || null, phone || null, role, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.json({
      status: "ok",
      message: "User updated successfully",
      user: { id: parseInt(id), firstname, lastname, email, address, phone, role }
    });

  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: "error", message: "This email is already in use." });
    }
    console.error("Error updating user: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Delete user (Admin Only)
//----------------------------------------
export async function deleteUser(req: RequestWithUser, res: Response) {
  const { id: userIdToDelete } = req.params;
  const token = req.user as JwtPayload
  const adminId = token.id

  if (String(adminId) === String(userIdToDelete)) {
    return res.status(403).json({
      status: "error",
      message: "Forbidden: Admin cannot delete their own account."
    });
  }

  try {
    const [results]: any = await pool.execute(
      "DELETE FROM users WHERE id = ?",
      [userIdToDelete]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    res.json({
      status: "ok",
      message: "User deleted successfully",
      userId: userIdToDelete
    });

  } catch (err: any) {
    console.error("Error deleting user: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}