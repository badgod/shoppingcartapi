import { Request, Response } from "express"
import pool from "../utils/db" 
import { RowDataPacket } from "mysql2" 

//----------------------------------------
// Get all categories (Customer & Admin)
//----------------------------------------
export async function getAllCategories(req: Request, res: Response) {
  try {
    const [results] = await pool.execute(
      "SELECT * FROM categories ORDER BY id ASC"
    );
    res.json(results);
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
    const [results] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ status: "error", message: "Category not found" });
    }
    res.json(results[0]);
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
    const [results]: any = await pool.execute(
      "INSERT INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, description || null]
    );
    res.status(201).json({
      status: "ok",
      message: "Category created successfully",
      category: {
        id: results.insertId,
        name,
        description
      }
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: "error", message: "Category name already exists" });
    }
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
    const [results]: any = await pool.execute(
      "UPDATE categories SET name = ?, description = ?, updated_at = NOW() WHERE id = ?",
      [name, description || null, id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Category not found" });
    }
    res.json({
      status: "ok",
      message: "Category updated successfully",
      category: { id: parseInt(id), name, description }
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: "error", message: "Category name already exists" });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Delete category (Admin Only)
//----------------------------------------
export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const [results]: any = await pool.execute(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Category not found" });
    }
    res.json({ status: "ok", message: "Category deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
}