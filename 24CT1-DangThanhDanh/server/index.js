import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.API_PORT || 3001)
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shopsach77',
    waitForConnections: true,
    connectionLimit: 10,
})

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1')
        res.json({ ok: true, database: 'mysql' })
    } catch (error) {
        res.status(503).json({ ok: false, message: 'Không kết nối được MySQL.', detail: error.code })
    }
})

app.get('/api/products', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products ORDER BY id DESC')
        res.json(rows)
    } catch (error) {
        res.status(500).json({ message: 'Không thể tải sản phẩm.', detail: error.code })
    }
})

app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    try {
        const [rows] = await pool.query('SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = ? LIMIT 1', [email])
        const user = rows[0]
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
        }
        delete user.passwordHash
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: 'Không thể đăng nhập.', detail: error.code })
    }
})

const initializeDatabase = async () => {
    const passwordHash = await bcrypt.hash('admin123', 10)
    await pool.execute(
        'INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['admin-1', 'Admin Shop', 'admin@shopsach77.vn', passwordHash, 'admin'],
    )
}

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`)
})

initializeDatabase().catch(error => {
    console.error('Không thể khởi tạo database:', error.code || error.message)
})
