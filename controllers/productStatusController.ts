import { Request, Response } from "express"
import connection from "../utils/db"

//----------------------------------------
// Get all statuses (Customer & Admin)
//----------------------------------------
export async function getAllStatuses(req: Request, res: Response) {
    try {
        connection.execute(
            "SELECT * FROM product_statuses ORDER BY id ASC",
            function (err, results) {
                if (err) {
                    return res.status(500).json({ status: "error", message: err.message });
                }
                res.json(results);
            }
        );
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
        connection.execute(
            "SELECT * FROM product_statuses WHERE id = ?",
            [id],
            function (err, results: any) {
                if (err) {
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.length === 0) {
                    return res.status(404).json({ status: "error", message: "Status not found" });
                }
                res.json(results[0]);
            }
        );
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
        connection.execute(
            "INSERT INTO product_statuses (name, created_at, updated_at) VALUES (?, NOW(), NOW())",
            [name],
            function (err, results: any) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ status: "error", message: "Status name already exists" });
                    }
                    return res.status(500).json({ status: "error", message: err.message });
                }
                res.status(201).json({
                    status: "ok",
                    message: "Status created successfully",
                    // *** แก้ไข: เปลี่ยน "status" เป็น "productStatus" ***
                    productStatus: {
                        id: results.insertId,
                        name
                    }
                });
            }
        );
    } catch (err: any) {
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
        connection.execute(
            "UPDATE product_statuses SET name = ?, updated_at = NOW() WHERE id = ?",
            [name, id],
            function (err, results: any) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ status: "error", message: "Status name already exists" });
                    }
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "Status not found" });
                }
                res.json({
                    status: "ok",
                    message: "Status updated successfully",
                    // *** แก้ไข: เปลี่ยน "status" เป็น "productStatus" ***
                    productStatus: { id, name }
                });
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Delete status (Admin Only)
//----------------------------------------
export async function deleteStatus(req: Request, res: Response) {
    const { id } = req.params;

    try {
        connection.execute(
            "DELETE FROM product_statuses WHERE id = ?",
            [id],
            function (err, results: any) {
                if (err) {
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "Status not found" });
                }
                res.json({ status: "ok", message: "Status deleted successfully" });
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}