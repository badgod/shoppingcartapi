import express, { Express } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'

// Initialize dotenv
dotenv.config()

// Initialize App
const app: Express = express()

// Parse incoming JSON requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Use Cors
app.use(cors())

// Use Static Files
app.use('/uploads', express.static('uploads'))
app.use('/uploads/images', express.static('uploads/images'))

// Routes
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import userRoutes from './routes/userRoutes' // <-- 1. Import
import categoryRoutes from './routes/categoryRoutes' // <-- 1. Import
import productStatusRoutes from './routes/productStatusRoutes' // <-- 2. Import
import orderRoutes from './routes/orderRoutes'

// Use Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes) // <-- 2. Use
app.use('/api/categories', categoryRoutes) // <-- 3. Use
app.use('/api/statuses', productStatusRoutes) // <-- 4. Use
app.use('/api/orders', orderRoutes)



// Listen Port
const port: string | number = process.env.PORT || 3000
const env: string = process.env.ENV || 'development'

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
  console.log(`App listening on env ${env}`)
  console.log(`Press Ctrl+C to quit.`)
})