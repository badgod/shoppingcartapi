import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Request, Response } from "express"
import connection from "../utils/db" 

// *** แก้ไข: เพิ่ม address และ phone ***
interface UserInput {
  firstname: string
  lastname: string
  email: string
  password: string
  address?: string // ทำให้เป็น optional
  phone?: string   // ทำให้เป็น optional
}

// Register function
async function register(req: Request, res: Response): Promise<void> {
  // *** แก้ไข: รับ address และ phone เพิ่ม ***
  const { firstname, lastname, email, password, address, phone }: UserInput = req.body

  // Check if the user already exists
  try {
    connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, results: any, fields) {
        if (err) {
          res.json({ status: "error", message: err })
          return
        } else {
          if (results.length > 0) {
            res.json({ status: "error", message: "Email already exists" })
            return
          } else {
            // Hash the password
            bcrypt.hash(password, 10, function (err, hash) {
              if (err) {
                res.json({ status: "error", message: err })
                return
              } else {
                
                // *** แก้ไข: เพิ่ม address, phone และ role ใน query ***
                // role จะถูกตั้งเป็น 'customer' อัตโนมัติโดย default value ในฐานข้อมูล
                // ที่เราตั้งไว้ใน migration ..._create_users_table.ts
                const query =
                  "INSERT INTO users (firstname, lastname, email, password, address, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())"
                const values = [firstname, lastname, email, hash, address || null, phone || null]

                // Insert the new user into the database
                connection.execute(
                  query,
                  values,
                  function (err, results: any, fields) {
                    if (err) {
                      res.json({ status: "error", message: err })
                      return
                    } else {
                      
                      // *** แก้ไข: Token ควรมี id และ role ด้วย ***
                      const token = jwt.sign(
                        { id: results.insertId, email: email, role: 'customer' }, // ใส่ role customer ไปเลย
                        process.env.JWT_SECRET || "",
                        { expiresIn: '1d' } // ตั้งเวลาหมดอายุ
                      )

                      res.json({
                        status: "ok",
                        message: "User registered successfully",
                        token: token,
                        user: {
                          id: results.insertId,
                          firstname: firstname,
                          lastname: lastname,
                          email: email,
                          address: address || null,
                          phone: phone || null,
                          role: 'customer' // ส่ง role กลับไปด้วย
                        },
                      })
                    }
                  }
                )
              }
            })
          }
        }
      }
    )
  } catch (err) {
    console.error("Error storing user in the database: ", err)
    res.sendStatus(500)
  }
}

// Login function
async function login(req: Request, res: Response): Promise<void> {
  const { email, password }: UserInput = req.body

  try {
    // *** แก้ไข: SELECT * เพื่อเอาข้อมูลทั้งหมด ***
    connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
      function (err, results: any, fields) {
        if (err) {
          res.json({ status: "error", message: err })
          return
        } else {
          if (results.length > 0) {
            const user = results[0] // เก็บข้อมูล user ทั้งหมด
            // Compare the password with the hash
            bcrypt.compare(
              password,
              user.password, // ใช้ user.password
              function (err, result) {
                if (err) {
                  res.json({ status: "error", message: err })
                  return
                } else {
                  if (result) {
                    
                    // *** แก้ไข: Token ควรมี id และ role ***
                    const token = jwt.sign(
                      { id: user.id, email: user.email, role: user.role },
                      process.env.JWT_SECRET || "",
                      { expiresIn: '1d' } // ตั้งเวลาหมดอายุ
                    )

                    res.json({
                      status: "ok",
                      message: "User logged in successfully",
                      token: token,
                      // *** แก้ไข: ส่งข้อมูล user กลับไปทั้งหมด ***
                      user: {
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        address: user.address,
                        phone: user.phone,
                        role: user.role,
                        avatar: user.avatar
                      },
                    })
                  } else {
                    res.json({
                      status: "error",
                      message: "Email and password does not match",
                    })
                    return
                  }
                }
              }
            )
          } else {
            res.json({ status: "error", message: "Email does not exists" })
            return
          }
        }
      }
    )
  } catch (err) {
    console.error("Error querying the database: ", err)
    res.sendStatus(500)
  }
}

export { register, login }