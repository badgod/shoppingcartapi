import { Response } from "express"
import { RequestWithUser } from "../middleware/authMiddleware"
import pool from "../utils/db" // <-- 1. Import pool
import { JwtPayload } from "jsonwebtoken"
// --- 2. Import Type ที่จำเป็น ---
import { RowDataPacket, PoolConnection } from "mysql2/promise"

// Interface สำหรับข้อมูลตะกร้าสินค้าที่ส่งมาจาก Client
interface CartItem {
    product_id: number
    quantity: number
    price: number // ราคาต่อชิ้น (ณ ตอนที่ซื้อ)
}

interface CreateOrderInput {
    shipping_address: string
    total_price: number
    items: CartItem[] // รายการสินค้าในตะกร้า
}

//----------------------------------------
// Create Order (Customer Only)
//----------------------------------------
export async function createOrder(req: RequestWithUser, res: Response) {
    const { shipping_address, total_price, items }: CreateOrderInput = req.body;
    const token = req.user as JwtPayload
    const user_id = token.id

    if (!shipping_address || !total_price || !items || items.length === 0) {
        return res.status(400).json({ status: "error", message: "Missing required fields or cart is empty" });
    }

    // --- 3. แก้ไข: ประกาศ Type ให้ dbConn ---
    let dbConn: PoolConnection | undefined;

    try {
        dbConn = await pool.getConnection(); // 3.1 ดึง connection มา
        await dbConn.beginTransaction(); // 3.2 เริ่ม Transaction

        // 3.3 สร้าง Order หลัก (ใช้ dbConn)
        const [orderResult]: any = await dbConn.execute(
            "INSERT INTO orders (user_id, total_price, shipping_address, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', NOW(), NOW())",
            [user_id, total_price, shipping_address]
        );

        const newOrderId = orderResult.insertId;

        // 3.4 เตรียมข้อมูล 'order_items'
        const orderItemsData = items.map(item => [
            newOrderId,
            item.product_id,
            item.quantity,
            item.price
        ]);

        // 3.5 ใส่ข้อมูลลง 'order_items' (ใช้ dbConn)
        await dbConn.query(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
            [orderItemsData]
        );

        // 3.6 ตัดสต็อกสินค้า (ใช้ dbConn)
        const stockUpdates = items.map(item =>
            dbConn!.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", // <-- เพิ่มการตรวจสอบสต็อก
                [item.quantity, item.product_id, item.quantity]
            )
        );

        const stockUpdateResults = await Promise.all(stockUpdates);

        // ตรวจสอบว่าการตัดสต็อกสำเร็จทุกรายการ
        for (const result of stockUpdateResults) {
            const [resultSetHeader]: any = result;
            if (resultSetHeader.affectedRows === 0) {
                // ถ้ามีรายการใดรายการหนึ่งตัดสต็อกไม่สำเร็จ (เช่น ของหมด)
                throw new Error("Failed to update stock, product might be out of stock.");
            }
        }

        // 3.7 ถ้าทุกอย่างสำเร็จ
        await dbConn.commit(); // <-- ยืนยัน Transaction

        res.status(201).json({
            status: "ok",
            message: "Order created successfully",
            orderId: newOrderId
        });

    } catch (err: any) {
        console.error("Error creating order:", err);
        // 3.8 ถ้ามีปัญหา
        if (dbConn) await dbConn.rollback(); // <-- ยกเลิก Transaction
        res.status(500).json({ status: "error", message: err.message || "Failed to create order" });
    } finally {
        // 3.9 คืน connection กลับเข้า pool
        if (dbConn) dbConn.release();
    }
}

//----------------------------------------
// Get My Orders (Customer Only)
//----------------------------------------
export async function getMyOrders(req: RequestWithUser, res: Response) {
    const token = req.user as JwtPayload
    const user_id = token.id

    try {
        // 4. ใช้ await pool.execute
        const [orders] = await pool.execute(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        );
        res.json(orders);
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Get All Orders (Admin Only)
//----------------------------------------
export async function getAllOrders(req: Request, res: Response) {
    try {
        // 4. ใช้ await pool.execute
        const [orders] = await pool.execute(
            `SELECT o.*, u.firstname, u.email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
        );
        res.json(orders);
    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}

//----------------------------------------
// Get Order Details (Both Customer and Admin)
//----------------------------------------
export async function getOrderDetails(req: RequestWithUser, res: Response) {
    const { id } = req.params; // Order ID
    const token = req.user as JwtPayload
    const user_id = token.id
    const user_role = token.role

    try {
        // 4. ใช้ await pool.execute
        const [orderResult] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }

        const order = orderResult[0];

        if (user_role !== 'admin' && order.user_id !== user_id) {
            return res.status(403).json({ status: "error", message: "Forbidden: You cannot access this order" });
        }

        const [items] = await pool.execute(
            `SELECT oi.*, p.name as product_name, p.image as product_image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
            [id]
        );

        res.json({
            order: order,
            items: items
        });

    } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
    }
}