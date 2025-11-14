import { Request, Response } from "express"
import pool from "../utils/db" 
import { RowDataPacket } from "mysql2" 

//----------------------------------------
// Get all statuses (Customer & Admin)
//----------------------------------------
export async function getAllStatuses(req: Request, res: Response) {
    try {
        const [results] = await pool.execute(
            "SELECT * FROM product_statuses ORDER BY id ASC"
        );
        res.json(results);
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Get status by id (Customer & Admin)
//----------------------------------------
export async function getStatusById(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const [results] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM product_statuses WHERE id = ?",
            [id]
        );
        if (results.length === 0) {
            return res.status(404).json({ status: "error", message: "Status not found" });
        }
        res.json(results[0]);
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Create status (Admin Only)
//----------------------------------------
export async function createStatus(req: Request, res: Response) {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ status: "error", message: "Name is required" });
    }

    try {
        const [results]: any = await pool.execute(
            "INSERT INTO product_statuses (name, created_at, updated_at) VALUES (?, NOW(), NOW())",
            [name]
        );
        res.status(201).json({
            status: "ok",
            message: "Status created successfully",
            productStatus: { 
                id: results.insertId,
                name
            }
        });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: "error", message: "Status name already exists" });
        }
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Update status (Admin Only)
//----------------------------------------
export async function updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ status: "error", message: "Name is required" });
    }

    try {
        const [results]: any = await pool.execute(
            "UPDATE product_statuses SET name = ?, updated_at = NOW() WHERE id = ?",
            [name, id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Status not found" });
        }
        res.json({
            status: "ok",
            message: "Status updated successfully",
            productStatus: { id: parseInt(id), name }
        });
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: "error", message: "Status name already exists" });
        }
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Delete status (Admin Only)
//----------------------------------------
export async function deleteStatus(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const [results]: any = await pool.execute(
            "DELETE FROM product_statuses WHERE id = ?",
            [id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Status not found" });
        }
        res.json({ status: "ok", message: "Status deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}