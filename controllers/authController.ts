import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Request, Response } from "express"
import pool from "../utils/db" 

// Interface UserInput
interface UserInput {
  firstname: string
  lastname: string
  email: string
  password: string
  address?: string
  phone?: string
}

// Register function
export async function register(req: Request, res: Response): Promise<void> {
  const { firstname, lastname, email, password, address, phone }: UserInput = req.body

  try {
    const [results]: any = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length > 0) {
      res.json({ status: "error", message: "Email already exists" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO users (firstname, lastname, email, password, address, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
    const values = [firstname, lastname, email, hash, address || null, phone || null];

    const [insertResult]: any = await pool.execute(query, values);

    const token = jwt.sign(
      { id: insertResult.insertId, email: email, role: 'customer' },
      process.env.JWT_SECRET || "",
      { expiresIn: '1d' }
    );

    res.json({
      status: "ok",
      message: "User registered successfully",
      token: token,
      user: {
        id: insertResult.insertId,
        firstname, lastname, email, address: address || null, phone: phone || null, role: 'customer'
      },
    });

  } catch (err: any) { 
    console.error("Error storing user in the database: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}

// Login function
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password }: UserInput = req.body

  try {
    const [results]: any = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      res.json({ status: "error", message: "Email does not exists" });
      return;
    }

    const user = results[0];
    
    const result = await bcrypt.compare(password, user.password);

    if (result) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "",
        { expiresIn: '1d' }
      );

      res.json({
        status: "ok",
        message: "User logged in successfully",
        token: token,
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
      });
    } else {
      res.json({
        status: "error",
        message: "Email and password does not match",
      });
    }

  } catch (err: any) {
    console.error("Error querying the database: ", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}