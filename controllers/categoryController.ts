import { Request, Response } from "express"
import connection from "../utils/db"

//----------------------------------------
// Get all categories (Customer & Admin)
//----------------------------------------
export async function getAllCategories(req: Request, res: Response) {
    try {
        connection.execute(
            "SELECT * FROM categories ORDER BY id ASC",
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
// Get category by id (Customer & Admin)
//----------------------------------------
export async function getCategoryById(req: Request, res: Response) {
    const { id } = req.params;
    try {
        connection.execute(
            "SELECT * FROM categories WHERE id = ?",
            [id],
            function (err, results: any) {
                if (err) {
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.length === 0) {
                    return res.status(404).json({ status: "error", message: "Category not found" });
                }
                res.json(results[0]);
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Create category (Admin Only)
//----------------------------------------
export async function createCategory(req: Request, res: Response) {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ status: "error", message: "Name is required" });
    }

    try {
        connection.execute(
            "INSERT INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
            [name, description || null],
            function (err, results: any) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ status: "error", message: "Category name already exists" });
                    }
                    return res.status(500).json({ status: "error", message: err.message });
                }
                res.status(201).json({
                    status: "ok",
                    message: "Category created successfully",
                    category: {
                        id: results.insertId,
                        name,
                        description
                    }
                });
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Update category (Admin Only)
//----------------------------------------
export async function updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ status: "error", message: "Name is required" });
    }

    try {
        connection.execute(
            "UPDATE categories SET name = ?, description = ?, updated_at = NOW() WHERE id = ?",
            [name, description || null, id],
            function (err, results: any) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ status: "error", message: "Category name already exists" });
                    }
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "Category not found" });
                }
                res.json({
                    status: "ok",
                    message: "Category updated successfully",
                    category: { id, name, description }
                });
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Delete category (Admin Only)
//----------------------------------------
export async function deleteCategory(req: Request, res: Response) {
    const { id } = req.params;

    // หมายเหตุ: FK ในตาราง products ถูกตั้งค่าเป็น onDelete('SET NULL')
    // ดังนั้นการลบ category จะทำให้ product.category_id เป็น NULL อัตโนมัติ
    try {
        connection.execute(
            "DELETE FROM categories WHERE id = ?",
            [id],
            function (err, results: any) {
                if (err) {
                    return res.status(500).json({ status: "error", message: err.message });
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ status: "error", message: "Category not found" });
                }
                res.json({ status: "ok", message: "Category deleted successfully" });
            }
        );
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}