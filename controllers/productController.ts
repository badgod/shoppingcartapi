import { Request, Response } from "express"
import multer from "multer"
import multerConfig from "../utils/multer_config"
import pool from "../utils/db" 
import { RequestWithUser } from "../middleware/authMiddleware"
import { JwtPayload } from "jsonwebtoken"
import fs from "fs"
import path from "path"
import { RowDataPacket } from "mysql2" 

const upload = multer(multerConfig.config).single(multerConfig.keyUpload)

//----------------------------------------
// Get all products
//----------------------------------------
export async function getAllProducts(req: Request, res: Response) { 
  try {
    // 4. ใช้ await pool.execute
    const [results] = await pool.execute(
      "SELECT * FROM products ORDER BY id DESC"
    );
    res.json(results);
  } catch (err: any) {
    console.error("Error querying products: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Get product by id
//----------------------------------------
export async function getProductById(req: Request, res: Response) { 
  try {
    const [results] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM products WHERE id = ?",
      [req.params.productId]
    );
    res.json(results[0] || {}); 
  } catch (err: any) {
    console.error("Error querying product: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

//----------------------------------------
// Create product
//----------------------------------------
export function createProduct(req: Request, res: Response) {
  upload(req as RequestWithUser, res, async (err) => { 
    if (err instanceof multer.MulterError) {
      console.log(`error: ${JSON.stringify(err)}`)
      return res.status(500).json({ message: err })
    } else if (err) {
      console.log(`error: ${JSON.stringify(err)}`)
      return res.status(500).json({ message: err })
    } else {
      try { 
        const {
          name, description, barcode, stock, price, category_id, status_id,
        } = req.body
        const token = (req as RequestWithUser).user as JwtPayload
        const user_id = token.id
        const image = req.file ? req.file.filename : null

        const [results]: any = await pool.execute(
          "INSERT INTO products (name, description, barcode, image, stock, price, category_id, user_id, status_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            name, description, barcode, image, stock, price,
            category_id, user_id, status_id,
          ]
        );

        res.json({
          status: "ok",
          message: "Product created successfully",
          product: {
            id: results.insertId, name, description, barcode, image, stock,
            price, category_id, user_id, status_id,
          },
        });
      } catch (err: any) {
        console.error("Error storing product in the database: ", err)
        res.status(500).json({ status: "error", message: err.message });
      }
    }
  })
}

//----------------------------------------
// Update product
//----------------------------------------
export function updateProduct(req: Request, res: Response) {
  upload(req as RequestWithUser, res, async (err) => { 
    if (err instanceof multer.MulterError) {
      console.log(`error: ${JSON.stringify(err)}`)
      return res.status(500).json({ message: err })
    } else if (err) {
      console.log(`error: ${JSON.stringify(err)}`)
      return res.status(500).json({ message: err })
    } else {
      try { 
        const {
          name, description, barcode, stock, price, category_id, status_id,
        } = req.body
        const token = (req as RequestWithUser).user as JwtPayload
        const user_id = token.id
        const image = req.file ? req.file.filename : null
        const { productId } = req.params;

        let sql =
          "UPDATE products SET name = ?, description = ?, barcode = ?, stock = ?, price = ?, category_id = ?, user_id = ?, status_id = ? WHERE id = ?"
        let params: any[] = [
          name, description, barcode, stock, price,
          category_id, user_id, status_id, productId,
        ]

        if (image) {
          sql =
            "UPDATE products SET name = ?, description = ?, barcode = ?, image = ?, stock = ?, price = ?, category_id = ?, user_id = ?, status_id = ? WHERE id = ?"
          params = [
            name, description, barcode, image, stock, price,
            category_id, user_id, status_id, productId,
          ]
        }

        const [results]: any = await pool.execute(sql, params);

        if (results.affectedRows === 0) {
          return res.status(404).json({ status: "error", message: "Product not found" });
        }

        res.json({
          status: "ok",
          message: "Product updated successfully",
          product: {
            id: productId, name, description, barcode, image,
            stock, price, category_id, user_id, status_id,
          },
        });

      } catch (err: any) {
        console.error("Error storing product in the database: ", err)
        res.status(500).json({ status: "error", message: err.message });
      }
    }
  })
}

//----------------------------------------
// Delete product
//----------------------------------------
export async function deleteProduct(req: Request, res: Response) { 
  const { productId } = req.params;

  try {
    // 1. ค้นหาสินค้า
    const [results] = await pool.execute<RowDataPacket[]>(
      "SELECT image FROM products WHERE id = ?",
      [productId]
    );

    if (results.length === 0) {
      return res.status(404).json({ status: "error", message: "Product not found" });
    }
    const imageName = results[0].image;

    const [deleteResult]: any = await pool.execute(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Product not found (race condition)" });
    }

    if (imageName) {
      const filePath = path.join(
        __dirname,
        "../../uploads/images/",
        imageName
      );
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting image file:", unlinkErr);
        }
      });
    }

    res.json({
      status: "ok",
      message: "Product deleted successfully",
      product: { id: productId },
    });

  } catch (err: any) {
    console.error("Error deleting product: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}