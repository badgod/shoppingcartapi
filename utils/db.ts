import mysql from "mysql2/promise" // <-- 1. เปลี่ยนเป็น 'mysql2/promise'
import { ConnectionOptions } from "mysql2"

const connectionConfig: ConnectionOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "3306"),
  database: process.env.DB_DATABASE,
  waitForConnections: true, // <-- 2. เพิ่ม Options สำหรับ Pool
  connectionLimit: 10,
  queueLimit: 0
}

// 3. เปลี่ยนจาก createConnection เป็น createPool
const pool = mysql.createPool(connectionConfig)

// 4. ไม่จำเป็นต้อง .connect() เอง Pool จะจัดการให้

export default pool // 5. Export pool ที่เป็น Promise-based