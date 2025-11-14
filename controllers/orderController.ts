import { Response } from "express"
import { RequestWithUser } from "../middleware/authMiddleware" // Import ตัวขยาย Request
import connection from "../utils/db"
import { JwtPayload } from "jsonwebtoken"

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

    // ใช้ Transaction เพื่อให้มั่นใจว่าทุกอย่างสำเร็จ หรือล้มเหลวพร้อมกันทั้งหมด
    // 1. สร้าง Order -> 2. ใส่ OrderItems -> 3. ตัด Stock
    try {
        // 1. สร้าง Order หลักในตาราง 'orders'
        const [orderResult]: any = await connection.promise().execute(
            "INSERT INTO orders (user_id, total_price, shipping_address, status, created_at, updated_at) VALUES (?, ?, ?, 'pending', NOW(), NOW())",
            [user_id, total_price, shipping_address]
        );

        const newOrderId = orderResult.insertId;

        // 2. เตรียมข้อมูลสำหรับ 'order_items'
        const orderItemsData = items.map(item => [
            newOrderId,
            item.product_id,
            item.quantity,
            item.price
        ]);

        // 2.1 ใส่ข้อมูลลง 'order_items' (Bulk Insert)
        await connection.promise().query(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
            [orderItemsData]
        );

        // 3. ตัดสต็อกสินค้า (สำคัญมาก)
        const stockUpdates = items.map(item =>
            connection.promise().execute(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                [item.quantity, item.product_id]
            )
        );

        // 3.1 รันคำสั่งตัดสต็อกทั้งหมด
        await Promise.all(stockUpdates);

        // ถ้าทุกอย่างสำเร็จ
        res.status(201).json({
            status: "ok",
            message: "Order created successfully",
            orderId: newOrderId
        });

    } catch (err: any) {
        console.error("Error creating order:", err);
        // (ใน Production จริง ควรมี Logic ในการ Rollback transaction)
        res.status(500).json({ status: "error", message: "Failed to create order", error: err.message });
    }
}

//----------------------------------------
// Get My Orders (Customer Only)
//----------------------------------------
export async function getMyOrders(req: RequestWithUser, res: Response) {
    const token = req.user as JwtPayload
    const user_id = token.id

    try {
        // ดึงออเดอร์ของ user ที่ login อยู่เท่านั้น
        const [orders] = await connection.promise().execute(
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
        // Admin ดึงได้ทุกออเดอร์ (อาจจะ JOIN User เพื่อดูชื่อ)
        const [orders] = await connection.promise().execute(
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
        // 1. ดึงข้อมูล Order หลัก
        const [orderResult]: any = await connection.promise().execute(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ status: "error", message: "Order not found" });
        }

        const order = orderResult[0];

        // 2. ตรวจสอบสิทธิ์: ต้องเป็น Admin หรือ เป็นเจ้าของออเดอร์
        if (user_role !== 'admin' && order.user_id !== user_id) {
            return res.status(403).json({ status: "error", message: "Forbidden: You cannot access this order" });
        }

        // 3. ดึงรายการสินค้า (order_items) ที่อยู่ในออเดอร์นี้
        const [items] = await connection.promise().execute(
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