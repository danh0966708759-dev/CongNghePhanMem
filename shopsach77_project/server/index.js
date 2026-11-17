import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.API_PORT || 3001)
const isProduction = process.env.NODE_ENV === 'production'
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop_sach_77project',
    waitForConnections: true,
    connectionLimit: 10,
})

const adminCookieName = 'shopsach77_session'
const sessionLifetime = 8 * 60 * 60
const sessionSecret = process.env.SESSION_SECRET || (isProduction ? '' : 'local-development-only-secret')
const frontendOrigins = (process.env.FRONTEND_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean)

if (isProduction && (
    sessionSecret.length < 32
    || !frontendOrigins.length
    || !process.env.ADMIN_EMAIL
    || !process.env.ADMIN_PASSWORD
    || process.env.ADMIN_PASSWORD.length < 12
)) {
    throw new Error('Production requires SESSION_SECRET (32+ chars), FRONTEND_ORIGIN, ADMIN_EMAIL, and ADMIN_PASSWORD (12+ chars).')
}

app.use(cors({
    origin(origin, callback) {
        const isLocalDevelopmentOrigin = !isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '')
        callback(null, !origin || frontendOrigins.includes(origin) || isLocalDevelopmentOrigin)
    },
    credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

const asyncHandler = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
const isTrustedOrigin = origin => frontendOrigins.includes(origin)
    || (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || ''))

const requireTrustedOrigin = (req, res, next) => {
    if (!req.get('origin') || !isTrustedOrigin(req.get('origin'))) {
        return res.status(403).json({ message: 'Nguồn yêu cầu không được phép.' })
    }
    next()
}

const createSession = userId => {
    const payload = Buffer.from(JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + sessionLifetime,
    })).toString('base64url')
    const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url')
    return `${payload}.${signature}`
}

const getSessionUserId = req => {
    const cookie = req.headers.cookie?.split(';').map(value => value.trim()).find(value => value.startsWith(`${adminCookieName}=`))
    const token = cookie?.slice(adminCookieName.length + 1)
    if (!token) return null

    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null
    const expected = crypto.createHmac('sha256', sessionSecret).update(payload).digest()
    const supplied = Buffer.from(signature, 'base64url')
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return null

    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
        return typeof session.sub === 'string' && session.exp > Math.floor(Date.now() / 1000) ? session.sub : null
    } catch {
        return null
    }
}

const cookieOptions = () => {
    const configuredSameSite = (process.env.COOKIE_SAME_SITE || 'Lax').toLowerCase()
    const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite) ? configuredSameSite : 'lax'
    return { sameSite, secure: isProduction || sameSite === 'none' }
}

const setSessionCookie = (res, token) => {
    const { sameSite, secure } = cookieOptions()
    res.setHeader('Set-Cookie', `${adminCookieName}=${token}; HttpOnly; Path=/api; Max-Age=${sessionLifetime}; SameSite=${sameSite}${secure ? '; Secure' : ''}`)
}

const clearSessionCookie = res => {
    const { sameSite, secure } = cookieOptions()
    res.setHeader('Set-Cookie', `${adminCookieName}=; HttpOnly; Path=/api; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${sameSite}${secure ? '; Secure' : ''}`)
}

const requireSession = async (req, res, next) => {
    const userId = getSessionUserId(req)
    if (!userId) return res.status(401).json({ message: 'Vui lòng đăng nhập.' })
    try {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1', [userId])
        if (!rows.length) {
            clearSessionCookie(res)
            return res.status(401).json({ message: 'Phiên đăng nhập không còn hợp lệ.' })
        }
        req.sessionUser = rows[0]
        next()
    } catch (error) {
        next(error)
    }
}

const requireAdmin = (req, res, next) => requireSession(req, res, error => {
    if (error) return next(error)
    if (res.headersSent || !req.sessionUser) return
    if (req.sessionUser.role !== 'admin') return res.status(403).json({ message: 'Bạn không có quyền quản trị.' })
    req.adminUser = req.sessionUser
    next()
})

const validateProduct = body => {
    const title = String(body.title || '').trim()
    const author = String(body.author || '').trim()
    const category = String(body.category || '').trim()
    const price = Number(body.price)
    const oldPrice = body.oldPrice == null || body.oldPrice === '' ? price : Number(body.oldPrice)
    const stock = body.stock == null ? 5 : Number(body.stock)
    if (!title || !author || !category
        || !Number.isSafeInteger(price) || price <= 0
        || !Number.isSafeInteger(oldPrice) || oldPrice < 0
        || !Number.isSafeInteger(stock) || stock < 0) {
        return { error: 'Thông tin sách hoặc giá, tồn kho không hợp lệ.' }
    }
    return {
        title, author, category, price, oldPrice, stock,
        badge: String(body.badge || 'Mới').trim(),
        img: String(body.img || '').trim(),
        description: String(body.description || '').trim(),
        hidden: body.hidden ? 1 : 0,
    }
}

const productFromRow = row => ({
    ...row,
    id: Number(row.id),
    price: Number(row.price),
    oldPrice: Number(row.oldPrice),
    stock: Number(row.stock),
    hidden: Boolean(row.hidden),
})

const mapOrderRows = rows => {
    const ordersById = new Map()
    for (const row of rows) {
        let order = ordersById.get(row.id)
        if (!order) {
            order = {
                id: row.id,
                orderCode: row.id,
                customerName: row.customerName || '',
                customerEmail: row.customerEmail || '',
                customerPhone: row.customerPhone || '',
                customerAddress: row.customerAddress || '',
                note: row.note || '',
                total: Number(row.total),
                paymentMethod: row.paymentMethod,
                paymentStatus: row.paymentStatus,
                createdAt: row.createdAt,
                items: [],
            }
            ordersById.set(row.id, order)
        }
        if (row.productId !== null) {
            order.items.push({
                id: Number(row.productId),
                title: row.title || 'Sách đã xóa',
                qty: Number(row.qty),
                price: Number(row.price),
            })
        }
    }
    return [...ordersById.values()]
}

const orderRowsForUser = async (userId = null) => {
    const userFilter = userId ? 'WHERE o.customer_id = ?' : ''
    const values = userId ? [userId] : []
    const [rows] = await pool.query(
        `SELECT o.id, o.customer_name AS customerName, COALESCE(o.customer_email, u.email, '') AS customerEmail,
                o.customer_phone AS customerPhone, o.customer_address AS customerAddress, o.note,
                o.total, o.payment_method AS paymentMethod, o.payment_status AS paymentStatus,
                o.created_at AS createdAt, oi.product_id AS productId, p.title,
                oi.quantity AS qty, oi.price
         FROM orders o
         LEFT JOIN users u ON u.id = o.customer_id
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         ${userFilter}
         ORDER BY o.created_at DESC, oi.id`,
        values,
    )
    return mapOrderRows(rows)
}

const insertStockUpdates = async (connection, items) => {
    for (const item of items) {
        await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.id])
    }
}

app.get('/api/health', asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1')
    res.json({ ok: true, database: 'mysql' })
}))

app.get('/api/products', asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
        'SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products ORDER BY id DESC',
    )
    res.json(rows.map(productFromRow))
}))

app.post('/api/products', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const product = validateProduct(req.body)
    if (product.error) return res.status(400).json({ message: product.error })
    const [result] = await pool.query(
        `INSERT INTO products (title, author, price, old_price, category, badge, img, description, stock, hidden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.title, product.author, product.price, product.oldPrice, product.category, product.badge, product.img, product.description, product.stock, product.hidden],
    )
    const [rows] = await pool.query(
        'SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products WHERE id = ?',
        [result.insertId],
    )
    res.status(201).json(productFromRow(rows[0]))
}))

app.put('/api/products/:id', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const product = validateProduct(req.body)
    if (product.error) return res.status(400).json({ message: product.error })
    const [result] = await pool.query(
        `UPDATE products SET title = ?, author = ?, price = ?, old_price = ?, category = ?,
                badge = ?, img = ?, description = ?, stock = ?, hidden = ? WHERE id = ?`,
        [product.title, product.author, product.price, product.oldPrice, product.category, product.badge, product.img, product.description, product.stock, product.hidden, req.params.id],
    )
    if (!result.affectedRows) {
        const [existing] = await pool.query('SELECT id FROM products WHERE id = ?', [req.params.id])
        if (!existing.length) return res.status(404).json({ message: 'Không tìm thấy sách.' })
    }
    const [rows] = await pool.query(
        'SELECT id, title, author, price, old_price AS oldPrice, category, badge, img, description, stock, hidden FROM products WHERE id = ?',
        [req.params.id],
    )
    res.json(productFromRow(rows[0]))
}))

app.delete('/api/products/:id', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const [borrowed] = await pool.query('SELECT id FROM borrow_items WHERE product_id = ? LIMIT 1', [req.params.id])
    const [ordered] = await pool.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [req.params.id])
    if (borrowed.length || ordered.length) {
        return res.status(409).json({ message: 'Sách đã có lịch sử đơn hàng hoặc phiếu mượn. Hãy ẩn sách thay vì xóa.' })
    }
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy sách.' })
    res.json({ ok: true })
}))

app.get('/api/users', requireAdmin, asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
        'SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC',
    )
    res.json(rows)
}))

app.post('/api/auth/register', requireTrustedOrigin, asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
        return res.status(400).json({ message: 'Vui lòng nhập họ tên, email hợp lệ và mật khẩu từ 6 ký tự.' })
    }
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = `user-${crypto.randomUUID()}`
    try {
        await pool.query(
            'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, passwordHash, 'customer'],
        )
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email này đã được sử dụng.' })
        throw error
    }
    setSessionCookie(res, createSession(userId))
    res.status(201).json({ id: userId, name, email, role: 'customer' })
}))

app.post('/api/auth/login', requireTrustedOrigin, asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const [rows] = await pool.query(
        'SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = ? LIMIT 1',
        [email],
    )
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
    }
    delete user.passwordHash
    setSessionCookie(res, createSession(user.id))
    res.json(user)
}))

app.post('/api/auth/admin/login', requireTrustedOrigin, asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' })
    const [rows] = await pool.query(
        'SELECT id, name, email, password_hash AS passwordHash, role FROM users WHERE email = ? AND role = ? LIMIT 1',
        [email, 'admin'],
    )
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu quản trị không đúng.' })
    }
    delete user.passwordHash
    setSessionCookie(res, createSession(user.id))
    res.json({ user })
}))

app.get('/api/auth/session', requireSession, (req, res) => {
    res.json({ user: req.sessionUser })
})

app.post('/api/auth/logout', requireTrustedOrigin, (_req, res) => {
    clearSessionCookie(res)
    res.json({ ok: true })
})

app.get('/api/orders', requireSession, asyncHandler(async (req, res) => {
    if (req.sessionUser.role !== 'customer') {
        return res.status(403).json({ message: 'Chỉ khách hàng mới có thể xem đơn hàng cá nhân.' })
    }
    res.json(await orderRowsForUser(req.sessionUser.id))
}))

app.post('/api/orders', requireTrustedOrigin, requireSession, asyncHandler(async (req, res) => {
    if (req.sessionUser.role !== 'customer') return res.status(403).json({ message: 'Tài khoản quản trị không thể đặt hàng.' })
    const { customerName, customerPhone, customerAddress, note, items } = req.body
    if (!String(customerName || '').trim()
        || !String(customerPhone || '').trim() || !String(customerAddress || '').trim()
        || !Array.isArray(items) || items.length === 0 || items.length > 50) {
        return res.status(400).json({ message: 'Thông tin người nhận hoặc danh sách sách không hợp lệ.' })
    }

    const quantities = new Map()
    for (const item of items) {
        const id = Number(item.id)
        const qty = Number(item.qty)
        if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Số lượng hoặc mã sách không hợp lệ.' })
        }
        quantities.set(id, (quantities.get(id) || 0) + qty)
    }

    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        const orderItems = []
        let total = 0
        for (const [productId, qty] of quantities) {
            const [rows] = await connection.query(
                'SELECT id, title, price, stock, hidden FROM products WHERE id = ? FOR UPDATE',
                [productId],
            )
            const product = rows[0]
            if (!product || product.hidden || product.stock < qty) {
                await connection.rollback()
                return res.status(409).json({ message: `Sách mã ${productId} hiện không đủ tồn kho.` })
            }
            total += Number(product.price) * qty
            orderItems.push({ id: Number(product.id), title: product.title, qty, price: Number(product.price) })
        }

        const orderId = `S77${Date.now().toString().slice(-8)}${crypto.randomInt(100, 1000)}`
        const paymentMethod = 'Quét mã QR thanh toán'
        const paymentStatus = 'Đã thanh toán qua mã QR (Chờ xác nhận)'
        await connection.query(
            `INSERT INTO orders
             (id, customer_id, customer_name, customer_email, customer_phone, customer_address, note, total, payment_method, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderId, req.sessionUser.id, String(customerName).trim(), req.sessionUser.email, String(customerPhone).trim(), String(customerAddress).trim(), String(note || '').trim(), total, paymentMethod, paymentStatus],
        )
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [orderItems.map(item => [orderId, item.id, item.qty, item.price])],
        )
        await insertStockUpdates(connection, orderItems)
        await connection.commit()
        const [stockRows] = await pool.query(
            `SELECT id, stock FROM products WHERE id IN (${orderItems.map(() => '?').join(',')})`,
            orderItems.map(item => item.id),
        )
        res.status(201).json({
            order: {
                id: orderId,
                orderCode: orderId,
                customerName: String(customerName).trim(),
                customerEmail: req.sessionUser.email,
                customerPhone: String(customerPhone).trim(),
                customerAddress: String(customerAddress).trim(),
                note: String(note || '').trim(),
                items: orderItems,
                total,
                paymentMethod,
                paymentStatus,
                createdAt: new Date().toISOString(),
            },
            stockByProduct: Object.fromEntries(stockRows.map(row => [row.id, Number(row.stock)])),
        })
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}))

app.get('/api/admin/orders', requireAdmin, asyncHandler(async (_req, res) => {
    res.json(await orderRowsForUser())
}))

app.put('/api/admin/orders/:id/status', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const validStatuses = [
        'Chờ xác nhận chuyển khoản',
        'Đã thanh toán qua mã QR (Chờ xác nhận)',
        'Đã xác nhận thanh toán',
        'Đang giao hàng',
        'Hoàn tất',
        'Đã hủy',
    ]
    if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' })
    }
    const [result] = await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [req.body.status, req.params.id])
    if (!result.affectedRows) {
        const [rows] = await pool.query('SELECT id FROM orders WHERE id = ?', [req.params.id])
        if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
    }
    res.json({ ok: true, paymentStatus: req.body.status })
}))

app.delete('/api/admin/orders/:id', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id])
    if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
    res.json({ ok: true })
}))

app.get('/api/admin/borrow-slips', requireAdmin, asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
        `SELECT s.id, s.member_name AS memberName, s.member_email AS memberEmail,
                s.due_at AS dueDate, s.borrowed_at AS createdAt, s.status,
                bi.product_id AS productId, p.title, bi.quantity AS qty
         FROM borrow_slips s
         LEFT JOIN borrow_items bi ON bi.slip_id = s.id
         LEFT JOIN products p ON p.id = bi.product_id
         ORDER BY s.borrowed_at DESC, bi.id`,
    )
    const slipsById = new Map()
    for (const row of rows) {
        let slip = slipsById.get(row.id)
        if (!slip) {
            slip = {
                id: row.id,
                memberName: row.memberName,
                memberEmail: row.memberEmail,
                dueDate: row.dueDate instanceof Date ? row.dueDate.toISOString().slice(0, 10) : String(row.dueDate).slice(0, 10),
                createdAt: row.createdAt,
                status: row.status,
                items: [],
            }
            slipsById.set(row.id, slip)
        }
        if (row.productId !== null) {
            slip.items.push({ id: Number(row.productId), title: row.title || 'Sách đã xóa', qty: Number(row.qty) })
        }
    }
    res.json([...slipsById.values()])
}))

app.post('/api/admin/borrow-slips', requireTrustedOrigin, requireAdmin, asyncHandler(async (req, res) => {
    const memberName = String(req.body.memberName || '').trim()
    const memberEmail = String(req.body.memberEmail || '').trim().toLowerCase()
    const dueDate = String(req.body.dueDate || '')
    const items = req.body.items
    const parsedDate = new Date(`${dueDate}T00:00:00.000Z`)
    if (!memberName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)
        || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(parsedDate.valueOf())
        || parsedDate.toISOString().slice(0, 10) !== dueDate || !Array.isArray(items) || !items.length) {
        return res.status(400).json({ message: 'Thông tin người mượn, hạn trả hoặc sách không hợp lệ.' })
    }

    const quantities = new Map()
    for (const item of items) {
        const id = Number(item.id)
        const qty = Number(item.qty)
        if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Số lượng hoặc mã sách không hợp lệ.' })
        }
        quantities.set(id, (quantities.get(id) || 0) + qty)
    }

    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        const slipItems = []
        for (const [productId, qty] of quantities) {
            const [rows] = await connection.query(
                'SELECT id, title, stock, hidden FROM products WHERE id = ? FOR UPDATE',
                [productId],
            )
            const product = rows[0]
            if (!product || product.hidden || product.stock < qty) {
                await connection.rollback()
                return res.status(409).json({ message: `Sách mã ${productId} hiện không đủ tồn kho.` })
            }
            slipItems.push({ id: Number(product.id), title: product.title, qty })
        }

        const slipId = `PM-${Date.now()}-${crypto.randomInt(100, 1000)}`
        await connection.query(
            `INSERT INTO borrow_slips (id, member_name, member_email, created_by, due_at, status)
             VALUES (?, ?, ?, ?, ?, 'Đang mượn')`,
            [slipId, memberName, memberEmail, req.adminUser.id, dueDate],
        )
        await connection.query(
            'INSERT INTO borrow_items (slip_id, product_id, quantity, returned_quantity) VALUES ?',
            [slipItems.map(item => [slipId, item.id, item.qty, 0])],
        )
        await insertStockUpdates(connection, slipItems)
        await connection.commit()

        const [stockRows] = await pool.query(
            `SELECT id, stock FROM products WHERE id IN (${slipItems.map(() => '?').join(',')})`,
            slipItems.map(item => item.id),
        )
        res.status(201).json({
            slip: {
                id: slipId,
                memberName,
                memberEmail,
                dueDate,
                createdAt: new Date().toISOString(),
                status: 'Đang mượn',
                items: slipItems,
            },
            stockByProduct: Object.fromEntries(stockRows.map(row => [row.id, Number(row.stock)])),
        })
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}))

app.use((error, _req, res, _next) => {
    console.error('Lỗi API:', error)
    res.status(500).json({ message: 'Có lỗi máy chủ. Vui lòng thử lại.' })
})

const initializeDatabase = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    const orderColumns = [
        ['customer_name', 'VARCHAR(120) NULL'],
        ['customer_email', 'VARCHAR(190) NULL'],
        ['customer_phone', 'VARCHAR(40) NULL'],
        ['customer_address', 'TEXT NULL'],
        ['note', 'TEXT NULL'],
    ]
    for (const [column, definition] of orderColumns) {
        const [rows] = await pool.query(
            'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
            ['orders', column],
        )
        if (!rows.length) await pool.query(`ALTER TABLE orders ADD COLUMN ${column} ${definition}`)
    }
    await pool.query('ALTER TABLE orders MODIFY customer_id VARCHAR(64) NULL')
    await pool.query('ALTER TABLE products MODIFY id BIGINT NOT NULL AUTO_INCREMENT')
    await pool.query('SELECT id FROM products LIMIT 1')
    await pool.query('SELECT id FROM orders LIMIT 1')
    await pool.query('SELECT id FROM borrow_slips LIMIT 1')

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        if (process.env.ADMIN_PASSWORD.length < 12) {
            throw new Error('ADMIN_PASSWORD must contain at least 12 characters.')
        }
        const email = process.env.ADMIN_EMAIL.trim().toLowerCase()
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
        await pool.execute(
            `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')
             ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
            [`admin-${crypto.randomUUID()}`, process.env.ADMIN_NAME?.trim() || 'Quản trị viên Shop', email, passwordHash],
        )
    } else {
        console.warn('Admin account is not configured; set ADMIN_EMAIL and ADMIN_PASSWORD to enable admin login.')
    }
}

initializeDatabase().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`API running at http://127.0.0.1:${port} (Cổng ${port})`)
    })
}).catch(error => {
    console.error('Không thể khởi tạo database:', error.code || error.message)
    process.exitCode = 1
})
