import { useMemo, useState, useEffect } from 'react'
import './App.css'

const categories = ['Tất cả', 'Văn học', 'Kinh tế', 'Kỹ năng sống', 'Thiếu nhi', 'Manga - Comic']
const categoryMenu = [
  { name: 'Văn học', children: ['Văn học hiện đại', 'Văn học kinh điển', 'Văn học thiếu nhi', 'Lãng mạn', 'Tản văn', 'Thơ - kịch'] },
  { name: 'Kinh tế', children: ['Kinh tế - Quản lý', 'Marketing - Bán hàng', 'Khởi nghiệp', 'Tài chính cá nhân'] },
  { name: 'Thiếu nhi', children: ['Truyện tranh', 'Truyện cổ tích', 'Sách tranh', 'Doraemon và truyện thiếu nhi'] },
  { name: 'Kỹ năng sống', children: ['Phát triển bản thân', 'Tâm lý', 'Giao tiếp', 'Thói quen tốt'] },
  { name: 'Manga - Comic', children: ['Manga', 'Comic', 'Graphic novel', 'Light novel'] },
]

const newsItems = [
  { date: '08.09.2026', title: 'Gợi ý những cuốn sách đáng đọc trong tháng', text: 'Chọn một cuốn sách phù hợp để bắt đầu tháng mới bằng một ý tưởng mới.' },
  { date: '04.09.2026', title: 'Không gian đọc sách và những câu chuyện đẹp', text: 'Cùng SHOP SÁCH 77 khám phá các tác phẩm được độc giả yêu thích.' },
  { date: '01.09.2026', title: 'Sách mới về kỹ năng và phát triển bản thân', text: 'Những tựa sách thực tế giúp bạn học tập, làm việc và sống tốt hơn mỗi ngày.' },
]

const initialProducts = [
  { id: 1, title: 'Nhà giả kim', author: 'Paulo Coelho', price: 79000, oldPrice: 99000, category: 'Văn học', badge: 'Bán chạy', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 2, title: 'Tuổi trẻ đáng giá bao nhiêu?', author: 'Rosie Nguyễn', price: 68000, oldPrice: 85000, category: 'Kỹ năng sống', badge: '-20%', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 3, title: 'Đắc nhân tâm', author: 'Dale Carnegie', price: 86000, oldPrice: 110000, category: 'Kỹ năng sống', badge: 'Bán chạy', img: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 4, title: 'Những người khốn khổ', author: 'Victor Hugo', price: 145000, oldPrice: 180000, category: 'Văn học', badge: 'Mới', img: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 5, title: 'Đi tìm lẽ sống', author: 'Viktor E. Frankl', price: 92000, oldPrice: 115000, category: 'Kỹ năng sống', badge: '-20%', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 6, title: 'Dế Mèn phiêu lưu ký', author: 'Tô Hoài', price: 55000, oldPrice: 65000, category: 'Thiếu nhi', badge: 'Yêu thích', img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 7, title: 'Thao túng tâm lý', author: 'Sherry Argov', price: 99000, oldPrice: 125000, category: 'Tâm lý', badge: 'Hot', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 8, title: 'Cây cam ngọt của tôi', author: 'José Mauro de Vasconcelos', price: 89000, oldPrice: 108000, category: 'Văn học', badge: 'Mới', img: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 9, title: 'Spider-Man: Người Nhện', author: 'Marvel Comics', price: 129000, oldPrice: 159000, category: 'Manga - Comic', badge: 'Hot', img: 'https://images.unsplash.com/photo-1601645191163-3fc0d5d64e35?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 10, title: 'Avengers: Biệt Đội Siêu Anh Hùng', author: 'Marvel Comics', price: 139000, oldPrice: 169000, category: 'Manga - Comic', badge: 'Mới', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 11, title: 'X-Men: Những Dị Nhân', author: 'Marvel Comics', price: 125000, oldPrice: 155000, category: 'Manga - Comic', badge: 'Bán chạy', img: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 12, title: 'Guardians of the Galaxy', author: 'Marvel Comics', price: 119000, oldPrice: 149000, category: 'Manga - Comic', badge: 'Mới', img: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&w=500&q=80', hidden: false },
  { id: 13, title: 'Cha Giàu Cha Nghèo', author: 'Robert T. Kiyosaki', price: 99000, oldPrice: 129000, category: 'Kinh tế', badge: 'Bán chạy', img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=80', description: 'Cuốn sách giới thiệu tư duy về tiền bạc, tài sản và cách xây dựng nền tảng tài chính cá nhân.', hidden: false },
  { id: 14, title: 'Từ Tốt Đến Vĩ Đại', author: 'Jim Collins', price: 125000, oldPrice: 155000, category: 'Kinh tế', badge: 'Mới', img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=80', description: 'Nghiên cứu những đặc điểm giúp một doanh nghiệp chuyển từ hoạt động tốt sang tạo ra kết quả vượt trội trong dài hạn.', hidden: false },
  { id: 15, title: 'Khởi Nghiệp Tinh Gọn', author: 'Eric Ries', price: 115000, oldPrice: 145000, category: 'Kinh tế', badge: 'Hot', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=80', description: 'Phương pháp xây dựng sản phẩm bằng thử nghiệm nhanh, học hỏi từ khách hàng và cải tiến liên tục.', hidden: false },
  { id: 16, title: 'Nghệ Thuật Bán Hàng', author: 'Brian Tracy', price: 89000, oldPrice: 119000, category: 'Kinh tế', badge: 'Yêu thích', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80', description: 'Các nguyên tắc thực hành về chuẩn bị, giao tiếp, xử lý nhu cầu và xây dựng quan hệ với khách hàng.', hidden: false },
  { id: 17, title: 'Dế Mèn phiêu lưu ký', author: 'Tô Hoài', price: 55000, oldPrice: 65000, category: 'Thiếu nhi', badge: 'Yêu thích', img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80', description: 'Câu chuyện phiêu lưu giàu trí tưởng tượng, giúp trẻ nhỏ học về tình bạn, lòng dũng cảm và cách trưởng thành.', hidden: false },
  { id: 18, title: 'Alice ở xứ sở thần tiên', author: 'Lewis Carroll', price: 69000, oldPrice: 85000, category: 'Thiếu nhi', badge: 'Mới', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80', description: 'Một chuyến phiêu lưu kỳ ảo trong thế giới kỳ quặc, đầy nhân vật lạ và những câu đố thú vị.', hidden: false },
  { id: 19, title: 'Hoàng tử bé', author: 'Antoine de Saint-Exupéry', price: 79000, oldPrice: 99000, category: 'Thiếu nhi', badge: 'Bán chạy', img: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=500&q=80', description: 'Tác phẩm thiếu nhi giàu chất thơ về tình bạn, tình yêu và cách nhìn thế giới bằng sự hồn nhiên.', hidden: false },
  { id: 20, title: 'Pinocchio', author: 'Carlo Collodi', price: 59000, oldPrice: 75000, category: 'Thiếu nhi', badge: 'Nên đọc', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80', description: 'Câu chuyện về cậu bé người gỗ Pinocchio và hành trình học cách trung thực, tốt bụng và có trách nhiệm.', hidden: false },
]

const defaultUsers = [
  { id: 'admin-1', name: 'Admin Shop', email: 'admin@shopsach77.vn', password: 'admin123', role: 'admin' },
]


const STORAGE_KEYS = {
  users: 'shopsach77_users',
  session: 'shopsach77_session',
  products: 'shopsach77_products',
  orders: 'shopsach77_orders',
  borrowSlips: 'shopsach77_borrow_slips',
  favorites: 'shopsach77_favorites',
}

const formatPrice = (n) => n.toLocaleString('vi-VN') + 'đ'
const normalizeText = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function Icon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" /></>,
    cart: <><path d="M3 4h2l2 11h10l2-8H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    arrow: <path d="m9 18 6-6-6-6" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    heart: <path d="M20.8 8.6c0 5.2-8.8 10.4-8.8 10.4S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.3Z" />,
    dashboard: <><path d="M4 13h7V4H4zm9 7h7V10h-7zm0-16v7h7V4zm-9 9h7v7H4z" /></>,
    copy: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke="currentColor" fill="none" strokeWidth="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" stroke="currentColor" fill="none" strokeWidth="2" /></>,
    check: <path d="M20 6 9 17l-5-5" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    qr: <><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 14h3v3h-3zM14 18h3v3h-3zM18 18h3v3h-3z" stroke="currentColor" fill="none" strokeWidth="1.8" /><path d="M5.5 5.5h2v2h-2zM16.5 5.5h2v2h-2zM5.5 16.5h2v2h-2z" fill="currentColor" /></>,
    package: <><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" fill="none" strokeWidth="1.8" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" fill="none" strokeWidth="1.8" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [products, setProducts] = useState(() => {
    const storedProducts = readStorage(STORAGE_KEYS.products, null)
    if (!storedProducts) return initialProducts.map(product => ({ ...product, stock: 5 }))

    const updatedStoredProducts = storedProducts.map(item => {
      const defaultProduct = initialProducts.find(product => product.id === item.id)
      if (!defaultProduct) return item

      const isChildrenProductReplacement = item.id >= 17 && item.id <= 20
      const updatedProduct = isChildrenProductReplacement
        ? { ...defaultProduct, hidden: item.hidden, stock: item.stock ?? 5 }
        : (!item.description ? { ...item, description: defaultProduct.description, stock: item.stock ?? 5 } : { ...item, stock: item.stock ?? 5 })
      return isChildrenProductReplacement
        ? { ...updatedProduct, img: defaultProduct.img }
        : updatedProduct
    })
    const missingProducts = initialProducts.filter(product => !storedProducts.some(item => item.id === product.id))
    return [...updatedStoredProducts, ...missingProducts]
  })
  const [users, setUsers] = useState(() => readStorage(STORAGE_KEYS.users, defaultUsers))
  const [currentUser, setCurrentUser] = useState(() => readStorage(STORAGE_KEYS.session, null))
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, []))
  const [borrowSlips, setBorrowSlips] = useState(() => readStorage(STORAGE_KEYS.borrowSlips, []))
  const [favorites, setFavorites] = useState(() => readStorage(STORAGE_KEYS.favorites, []))
  const [category, setCategory] = useState('Tất cả')
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [hoveredMenuCategory, setHoveredMenuCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [selected, setSelected] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [checkout, setCheckout] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', note: '' })
  const [checkoutCode, setCheckoutCode] = useState('')
  const [copiedField, setCopiedField] = useState(null)
  const [qrError, setQrError] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [myOrdersOpen, setMyOrdersOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [adminOpen, setAdminOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState({
    title: '',
    author: '',
    category: 'Văn học',
    price: '',
    oldPrice: '',
    badge: 'Mới',
    stock: 5,
    img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80',
  })
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [borrowOpen, setBorrowOpen] = useState(false)
  const [borrowForm, setBorrowForm] = useState({ memberName: '', memberEmail: '', dueDate: '' })
  const [borrowItems, setBorrowItems] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.borrowSlips, JSON.stringify(borrowSlips))
  }, [borrowSlips])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(STORAGE_KEYS.session)
    }
  }, [currentUser])

  const filtered = useMemo(() => products.filter(p =>
    !p.hidden &&
    (!query.trim() && category !== 'Tất cả' ? p.category === category : true) &&
    normalizeText(`${p.title} ${p.author}`).includes(normalizeText(query))
  ), [products, category, query])

  const searchResults = useMemo(() => {
    const searchText = normalizeText(query.trim())
    if (!searchText) return []
    return products.filter(product =>
      !product.hidden &&
      normalizeText(`${product.title} ${product.author}`).includes(searchText)
    )
  }, [products, query])

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const userOrders = useMemo(() => {
    if (!currentUser) return []
    return orders.filter(o => o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase())
  }, [orders, currentUser])

  const openAuth = (mode = 'login') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const email = authForm.email.trim().toLowerCase()
    const localUser = users.find(user => user.email.toLowerCase() === email && user.password === authForm.password)
    if (localUser) {
      setCurrentUser(localUser)
      setAuthOpen(false)
      setAuthForm({ name: '', email: '', password: '' })
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: authForm.password,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        alert(result.message || 'Email hoặc mật khẩu không đúng.')
        return
      }

      setCurrentUser(result)
      setAuthOpen(false)
      setAuthForm({ name: '', email: '', password: '' })
    } catch {
      alert('Chưa kết nối được máy chủ đăng nhập. Hãy chạy npm run server và MySQL, hoặc kiểm tra lại tài khoản.')
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()

    const trimmedName = authForm.name.trim()
    const trimmedEmail = authForm.email.trim().toLowerCase()

    if (!trimmedName || !trimmedEmail || !authForm.password) {
      alert('Vui lòng điền đủ thông tin.')
      return
    }

    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      alert('Email này đã được đăng ký.')
      return
    }

    const newUser = {
      id: Date.now().toString(),
      name: trimmedName,
      email: trimmedEmail,
      password: authForm.password,
      role: 'customer',
    }

    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    setAuthOpen(false)
    setAuthForm({ name: '', email: '', password: '' })
    alert('Đăng ký thành công! Bạn đã được đăng nhập.')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCart([])
    setAdminOpen(false)
    setCartOpen(false)
  }

  const addToCart = (product) => {
    if (!currentUser) {
      openAuth('login')
      return
    }

    setCart(items => {
      const found = items.find(i => i.id === product.id)
      return found ? items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) : [...items, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  const changeQty = (id, delta) => setCart(items => items.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  const remove = (id) => setCart(items => items.filter(i => i.id !== id))

  const toggleFavorite = (product) => {
    setFavorites(items => items.some(item => item.id === product.id)
      ? items.filter(item => item.id !== product.id)
      : [...items, product]
    )
  }

  const toggleProductHidden = (id) => {
    setProducts(prev => prev.map(item => item.id === id ? { ...item, hidden: !item.hidden } : item))
  }

  const resetProductForm = () => {
    setProductForm({
      title: '',
      author: '',
      category: 'Văn học',
      price: '',
      oldPrice: '',
      badge: 'Mới',
      stock: 5,
      img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80',
    })
    setEditingProductId(null)
  }

  const handleAddProduct = (e) => {
    e.preventDefault()

    if (!productForm.title.trim() || !productForm.author.trim() || !productForm.img.trim()) {
      alert('Vui lòng điền tên sách, tác giả và ảnh.')
      return
    }

    const price = Number(productForm.price)
    const oldPrice = Number(productForm.oldPrice) || price

    if (!Number.isFinite(price) || price <= 0) {
      alert('Giá sách không hợp lệ.')
      return
    }

    const productData = {
      title: productForm.title.trim(),
      author: productForm.author.trim(),
      category: productForm.category,
      price,
      oldPrice,
      badge: productForm.badge || 'Mới',
      stock: Math.max(0, Number(productForm.stock) || 0),
      img: productForm.img.trim(),
    }

    if (editingProductId !== null) {
      const productExists = products.some(item => item.id === editingProductId)

      if (!productExists) {
        alert('Không tìm thấy sách cần cập nhật. Vui lòng chọn lại sách.')
        resetProductForm()
        return
      }

      setProducts(prev => prev.map(item => item.id === editingProductId ? { ...item, ...productData } : item))
      setSelected(prev => prev?.id === editingProductId ? { ...prev, ...productData } : prev)
      setCart(prev => prev.map(item => item.id === editingProductId ? { ...item, ...productData } : item))
      resetProductForm()
      alert('Cập nhật sách thành công!')
      return
    } else {
      const newProduct = {
        id: Date.now(),
        ...productData,
        hidden: false,
      }
      setProducts(prev => [newProduct, ...prev])
      alert('Thêm sách thành công!')
    }

    resetProductForm()
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setProductForm({
      title: product.title,
      author: product.author,
      category: product.category,
      price: String(product.price),
      oldPrice: String(product.oldPrice),
      badge: product.badge,
      stock: product.stock ?? 0,
      img: product.img,
    })
  }

  const handleDeleteProduct = (id) => {
    const product = products.find(item => item.id === id)
    if (!product) return

    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa sách "${product.title}" không?`)
    if (!confirmDelete) return

    setProducts(prev => prev.filter(item => item.id !== id))
  }

  const addBorrowBook = (product) => {
    if (!product.stock) {
      alert('Sách này đã hết trong kho.')
      return
    }

    setBorrowItems(items => {
      const found = items.find(item => item.id === product.id)
      if (found) {
        return items.map(item => item.id === product.id
          ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
          : item)
      }
      return [...items, { ...product, qty: 1 }]
    })
  }

  const changeBorrowQty = (id, delta) => {
    setBorrowItems(items => items
      .map(item => item.id === id ? { ...item, qty: Math.max(0, Math.min(item.qty + delta, item.stock)) } : item)
      .filter(item => item.qty > 0))
  }

  const resetBorrowForm = () => {
    setBorrowForm({ memberName: '', memberEmail: '', dueDate: '' })
    setBorrowItems([])
  }

  const handleBorrowSubmit = (e) => {
    e.preventDefault()
    if (!borrowForm.memberName.trim() || !borrowForm.memberEmail.trim() || !borrowForm.dueDate || !borrowItems.length) {
      alert('Vui lòng nhập người mượn, email, hạn trả và chọn ít nhất một sách.')
      return
    }

    const slip = {
      id: `PM-${Date.now()}`,
      memberName: borrowForm.memberName.trim(),
      memberEmail: borrowForm.memberEmail.trim().toLowerCase(),
      dueDate: borrowForm.dueDate,
      createdAt: new Date().toISOString(),
      status: 'Đang mượn',
      items: borrowItems.map(item => ({ id: item.id, title: item.title, qty: item.qty })),
    }

    setBorrowSlips(prev => [slip, ...prev])
    setProducts(prev => prev.map(product => {
      const borrowed = borrowItems.find(item => item.id === product.id)
      return borrowed ? { ...product, stock: Math.max(0, (product.stock ?? 0) - borrowed.qty) } : product
    }))
    resetBorrowForm()
    setBorrowOpen(false)
    alert(`Đã lập phiếu mượn ${slip.id}. Số lượng sách đã được cập nhật.`)
  }

  const openCheckout = () => {
    if (!currentUser) {
      setCartOpen(false)
      openAuth('login')
      return
    }
    setCheckoutForm({
      name: currentUser.name || '',
      phone: '',
      address: '',
      note: '',
    })
    setCheckoutCode(`S77${Math.floor(100000 + Math.random() * 900000)}`)
    setQrError(false)
    setCheckout(true)
    setCartOpen(false)
  }

  const handleCopy = (text, fieldKey) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const fallbackCopy = (text) => {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    try {
      document.execCommand('copy')
    } catch {
      // ignore
    }
    document.body.removeChild(el)
  }

  const handleCheckoutSubmit = (e) => {
    if (e) e.preventDefault()

    if (!currentUser) {
      openAuth('login')
      return
    }

    if (!cart.length) {
      alert('Giỏ hàng đang trống.')
      return
    }

    const name = checkoutForm.name.trim()
    const phone = checkoutForm.phone.trim()
    const address = checkoutForm.address.trim()

    if (!name) {
      alert('Vui lòng nhập họ và tên người nhận hàng.')
      return
    }
    if (!phone) {
      alert('Vui lòng nhập số điện thoại nhận hàng.')
      return
    }
    if (phone.replace(/\D/g, '').length < 9) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập ít nhất 9 chữ số.')
      return
    }
    if (!address) {
      alert('Vui lòng nhập địa chỉ nhận hàng chi tiết.')
      return
    }

    const orderId = checkoutCode || `S77${Date.now().toString().slice(-6)}`
    const order = {
      id: orderId,
      orderCode: orderId,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerEmail: currentUser.email,
      note: checkoutForm.note.trim(),
      items: [...cart],
      total,
      paymentMethod: 'Quét mã QR thanh toán',
      paymentStatus: 'Đã thanh toán qua mã QR (Chờ xác nhận)',
      createdAt: new Date().toISOString(),
    }

    // Cập nhật số lượng tồn kho của sách
    setProducts(prev => prev.map(product => {
      const cartItem = cart.find(item => item.id === product.id)
      return cartItem ? { ...product, stock: Math.max(0, (product.stock ?? 0) - cartItem.qty) } : product
    }))

    setOrders(prev => [order, ...prev])
    setCart([])
    setCheckout(false)
    setSuccessOrder(order)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o))
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này khỏi hệ thống?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId))
    }
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    alert('Đăng ký nhận thông tin thành công!')
    setNewsletterEmail('')
  }

  const selectSearchResult = (product) => {
    setCategory('Tất cả')
    setQuery('')
    setTimeout(() => document.getElementById('product-' + product.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
  }

  const selectMenuCategory = (value) => {
    const matchedCategory = categories.find(item => normalizeText(item) === normalizeText(value))
    setCategory(matchedCategory || 'Tất cả')
    setQuery('')
    setCategoryMenuOpen(false)
    setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  return (
    <div className="site">
      <div className="topbar">MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 300.000Đ • ĐỔI TRẢ TRONG 7 NGÀY</div>

      <header className="header">
        <div className="header-inner">
          <button className="mobile-menu"><Icon name="menu" /></button>
          <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setCategory('Tất cả'); setQuery('') }}>
            <span className="logo-mark">S77</span>
            <span><b>SHOP SÁCH</b><small>Đọc sách • Sống hay</small></span>
          </a>

          <div className="search">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm sách, tác giả..." />
            <button><Icon name="search" /></button>
            {query.trim() && <div className="search-results">
              {searchResults.length ? searchResults.map(product => (
                <button className="search-result" key={product.id} onClick={() => selectSearchResult(product)}>
                  <img src={product.img} alt="" />
                  <span><b>{product.title}</b><small>{product.author} · {formatPrice(product.price)}</small></span>
                </button>
              )) : <p className="search-no-result">Không tìm thấy sách phù hợp.</p>}
            </div>}
          </div>

          <div className="header-actions">
            {currentUser && currentUser.role === 'admin' && (
              <button className="action" onClick={() => setAdminOpen(true)}>
                <Icon name="dashboard" />
                <span>Quản trị</span>
              </button>
            )}

            {currentUser ? (
              <div className="account-menu">
                <button className="action account-trigger" title={`Tài khoản ${currentUser.name}`}>
                  <Icon name="user" />
                  <span>{currentUser.name}</span>
                </button>
                <div className="account-dropdown">
                  <button onClick={() => setMyOrdersOpen(true)}>Đơn hàng của tôi</button>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            ) : (
              <button className="action" onClick={() => openAuth('login')}>
                <Icon name="user" />
                <span>Đăng nhập</span>
              </button>
            )}

            <button className="action cart-btn" onClick={() => setCartOpen(true)}>
              <Icon name="cart" /><span>Giỏ hàng</span><em>{cartCount}</em>
            </button>
            <button className="action favorite-btn" onClick={() => setFavoritesOpen(true)}>
              <Icon name="heart" /><span>Yêu thích</span><em>{favorites.length}</em>
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-inner">
          <div className="category-menu-wrap" onMouseEnter={() => setCategoryMenuOpen(true)} onMouseLeave={() => { setCategoryMenuOpen(false); setHoveredMenuCategory(null) }}>
            <button className="all-cats"><Icon name="menu" /> DANH MỤC SÁCH</button>
            {categoryMenuOpen && <div className="category-mega-menu">
              <div className="category-main-list">
                {categoryMenu.map(item => <button className={`category-main ${hoveredMenuCategory === item.name ? 'active' : ''}`} key={item.name} onMouseEnter={() => setHoveredMenuCategory(item.name)} onClick={() => selectMenuCategory(item.name)}>{item.name}<Icon name="arrow" /></button>)}
              </div>
              <div className="category-sub-list">{hoveredMenuCategory ? <>
                <div className="category-sub-heading">{hoveredMenuCategory}</div>
                <div className="category-sub-options">{categoryMenu.find(item => item.name === hoveredMenuCategory).children.map(child => <button key={child} onClick={() => selectMenuCategory(hoveredMenuCategory)}>{child}<Icon name="arrow" /></button>)}</div>
              </> : <div className="category-sub-empty">Rê chuột vào một nhóm sách để xem các mục con</div>}</div>
            </div>}
          </div>
          {categories.slice(1).map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}
          <button className="sale" onClick={() => setQuery('')}>KHUYẾN MÃI</button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">SHOP SÁCH 77</span>
            <h1>Mỗi trang sách<br /><strong>một hành trình mới.</strong></h1>
            <p>Khám phá những cuốn sách hay, chọn câu chuyện dành riêng cho bạn.</p>
            <button className="primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>KHÁM PHÁ NGAY <Icon name="arrow" /></button>
          </div>
          <div className="hero-books">
            <div className="hero-book back"><img src={products[3]?.img} alt="Sách" /></div>
            <div className="hero-book front"><img src={products[0]?.img} alt="Sách" /></div>
          </div>
        </section>

        <section className="benefits">
          <div><span>🚚</span><b>Giao hàng nhanh</b><small>Toàn quốc</small></div>
          <div><span>🎁</span><b>Ưu đãi mỗi tuần</b><small>Giá tốt cho bạn</small></div>
          <div><span>✓</span><b>Sách chính hãng</b><small>100% uy tín</small></div>
          <div><span>💬</span><b>Hỗ trợ tận tâm</b><small>08:00 - 22:00</small></div>
        </section>

        <section className="section" id="products">
          <div className="section-head">
            <div><span className="eyebrow">{query.trim() ? `KẾT QUẢ: ${filtered.length} SÁCH` : 'GỢI Ý CHO BẠN'}</span><h2>{query.trim() ? `Sách có tên hoặc tác giả liên quan đến “${query}”` : (category === 'Tất cả' ? 'Sách nổi bật' : category)}</h2></div>
            <button className="view-all" onClick={() => setCategory('Tất cả')}>Xem tất cả <Icon name="arrow" /></button>
          </div>
          <div className="chips">
            {categories.map(c => <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}
          </div>
          <div className="product-grid">
            {filtered.map(p => (
              <article className="product" id={`product-${p.id}`} key={p.id}>
                <button className={`heart ${favorites.some(item => item.id === p.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(p)} aria-label={favorites.some(item => item.id === p.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}><Icon name="heart" /></button>
                <button className="cover" onClick={() => setSelected(p)}><img src={p.img} alt={p.title} /><span>{p.badge}</span></button>
                <div className="product-info">
                  <small>{p.author}</small>
                  <h3>{p.title}</h3>
                  <div className="price"><b>{formatPrice(p.price)}</b><del>{formatPrice(p.oldPrice)}</del></div>
                  <small className="stock-label">Còn {p.stock ?? 0} cuốn</small>
                  <button className="add" onClick={() => addToCart(p)}>+ THÊM VÀO GIỎ</button>
                </div>
              </article>
            ))}
          </div>
          {!filtered.length && <div className="empty">Không tìm thấy sách phù hợp.</div>}
        </section>

        <section className="banner">
          <div><span className="eyebrow">ƯU ĐÃI THÁNG 9</span><h2>Đọc nhiều hơn,<br /><i>tiết kiệm nhiều hơn.</i></h2><p>Giảm đến 30% cho hàng trăm tựa sách được yêu thích.</p><button className="primary" onClick={() => setCategory('Tất cả')}>MUA SÁCH NGAY</button></div>
          <div className="banner-art">30<span>%</span><small>OFF</small></div>
        </section>

        <section className="section category-section">
          <div className="section-head"><div><span className="eyebrow">KHÁM PHÁ</span><h2>Chọn theo thể loại</h2></div></div>
          <div className="category-grid">
            {[
              ['Văn học', 'Những câu chuyện để nhớ', '📖'],
              ['Kỹ năng sống', 'Tốt hơn mỗi ngày', '🌱'],
              ['Kinh tế', 'Học cách tạo giá trị', '💡'],
              ['Thiếu nhi', 'Thế giới của bé', '⭐'],
            ].map(([name, desc, icon]) => <button key={name} onClick={() => { setCategory(name); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }) }}><span>{icon}</span><b>{name}</b><small>{desc}</small><Icon name="arrow" /></button>)}
          </div>
        </section>

        <section className="section book-shelves" id="discover">
          <div className="shelf-column">
            <div className="section-head"><div><span className="eyebrow">MỚI NHẤT</span><h2>Sách mới phát hành</h2></div></div>
            {products.slice(0, 4).map(product => <button className="mini-book" key={product.id} onClick={() => setSelected(product)}><img src={product.img} alt={product.title} /><span><b>{product.title}</b><small>{product.author}</small><strong>{formatPrice(product.price)}</strong></span></button>)}
          </div>
          <div className="shelf-column">
            <div className="section-head"><div><span className="eyebrow">ĐƯỢC YÊU THÍCH</span><h2>Sách nổi bật</h2></div></div>
            {products.slice(4, 8).map(product => <button className="mini-book" key={product.id} onClick={() => setSelected(product)}><img src={product.img} alt={product.title} /><span><b>{product.title}</b><small>{product.author}</small><strong>{formatPrice(product.price)}</strong></span></button>)}
          </div>
          <div className="shelf-column">
            <div className="section-head"><div><span className="eyebrow">GỢI Ý CHO BẠN</span><h2>Đọc và khám phá</h2></div></div>
            {products.slice(8, 12).map(product => <button className="mini-book" key={product.id} onClick={() => setSelected(product)}><img src={product.img} alt={product.title} /><span><b>{product.title}</b><small>{product.author}</small><strong>{formatPrice(product.price)}</strong></span></button>)}
          </div>
        </section>

        <section className="section news-section" id="news">
          <div className="section-head"><div><span className="eyebrow">TẠP CHÍ ĐỌC</span><h2>Tin tức và cảm hứng</h2></div><button className="view-all" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Xem thêm <Icon name="arrow" /></button></div>
          <div className="news-grid">{newsItems.map(item => <article className="news-card" key={item.title}><small>{item.date}</small><h3>{item.title}</h3><p>{item.text}</p><button>ĐỌC BÀI <Icon name="arrow" /></button></article>)}</div>
        </section>

        <section className="newsletter">
          <div><span className="eyebrow">Ở LẠI CÙNG NHỮNG TRANG SÁCH</span><h2>Nhận gợi ý sách hay mỗi tuần.</h2><p>Đăng ký để cập nhật sách mới, ưu đãi và những câu chuyện thú vị từ SHOP SÁCH 77.</p></div>
          <form onSubmit={handleNewsletterSubmit}><input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)} placeholder="Email của bạn" required /><button className="primary" type="submit">ĐĂNG KÝ <Icon name="arrow" /></button></form>
        </section>
      </main>

      <footer>
        <div className="footer-main">
          <div className="footer-brand"><div className="logo"><span className="logo-mark">S77</span><span><b>SHOP SÁCH</b><small>Đọc sách • Sống hay</small></span></div><p>Không gian dành cho những người yêu sách và những câu chuyện đẹp.</p></div>
          <div><h4>SHOP SÁCH 77</h4><a href="#discover">Khám phá sách</a><a href="#news">Tin tức</a><a href="#">Về chúng tôi</a></div>
          <div><h4>HỖ TRỢ</h4><a href="#">Chính sách đổi trả</a><a href="#">Chính sách vận chuyển</a><a href="#">Câu hỏi thường gặp</a></div>
          <div><h4>LIÊN HỆ</h4><p>Hotline: <b>1900 77 77</b></p><p>Email: support@shopsach77.vn</p><p>Địa chỉ: 23 Nguyễn Trãi, Hà Nội</p><p>Thứ 2 - Chủ nhật: 08:00 - 22:00</p></div>
        </div>
        <div className="copyright">© SHOP SÁCH 77. Thiết kế dành riêng cho website bán sách.</div>
      </footer>

      {selected && <div className="overlay" onClick={() => setSelected(null)}><div className="modal product-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><Icon name="close" /></button><img src={selected.img} alt={selected.title} /><div><small>{selected.author}</small><h2>{selected.title}</h2><p className="modal-desc">{selected.description || 'Một lựa chọn nổi bật tại SHOP SÁCH 77. Thêm sách vào giỏ để tiếp tục mua sắm.'}</p><div className="modal-price">{formatPrice(selected.price)} <del>{formatPrice(selected.oldPrice)}</del></div><button className="primary" onClick={() => { addToCart(selected); setSelected(null) }}>THÊM VÀO GIỎ</button></div></div></div>}

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-panel" onClick={e => e.stopPropagation()}><div className="panel-head"><h2>Giỏ hàng</h2><button onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>{cart.length ? <><div className="cart-items">{cart.map(i => <div className="cart-item" key={i.id}><img src={i.img} alt={i.title} /><div><b>{i.title}</b><small>{formatPrice(i.price)}</small><div className="qty"><button onClick={() => changeQty(i.id, -1)}><Icon name="minus" /></button><span>{i.qty}</span><button onClick={() => changeQty(i.id, 1)}><Icon name="plus" /></button><button className="remove" onClick={() => remove(i.id)}>Xóa</button></div></div></div>)}</div><div className="cart-total"><span>Tạm tính</span><b>{formatPrice(total)}</b></div><button className="checkout" onClick={openCheckout}>TIẾN HÀNH THANH TOÁN</button></> : <div className="cart-empty"><div>🛒</div><p>Giỏ hàng đang trống</p><button className="primary" onClick={() => setCartOpen(false)}>TIẾP TỤC MUA SẮM</button></div>}</aside></div>}

      {favoritesOpen && <div className="overlay" onClick={() => setFavoritesOpen(false)}><aside className="cart-panel favorites-panel" onClick={e => e.stopPropagation()}><div className="panel-head"><h2>Yêu thích</h2><button onClick={() => setFavoritesOpen(false)}><Icon name="close" /></button></div>{favorites.length ? <div className="cart-items">{favorites.map(item => <div className="cart-item" key={item.id}><img src={item.img} alt={item.title} /><div><b>{item.title}</b><small>{formatPrice(item.price)}</small><div className="favorite-actions"><button className="add" onClick={() => addToCart(item)}>+ THÊM VÀO GIỎ</button><button className="remove" onClick={() => toggleFavorite(item)}>Bỏ thích</button></div></div></div>)}</div> : <div className="cart-empty"><div>♡</div><p>Chưa có sách yêu thích</p><button className="primary" onClick={() => setFavoritesOpen(false)}>XEM SÁCH</button></div>}</aside></div>}

      {checkout && (
        <div className="overlay" onClick={() => setCheckout(false)}>
          <div className="modal checkout-modal simple-payment-modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setCheckout(false)}><Icon name="close" /></button>

            {/* Thông tin người nhận hàng */}
            <div className="checkout-receiver-box">
              <span className="receiver-box-title">Thông tin giao hàng</span>
              <div className="checkout-receiver-fields">
                <label>
                  Họ và tên <span className="req">*</span>
                  <input
                    value={checkoutForm.name}
                    onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </label>
                <label>
                  Số điện thoại <span className="req">*</span>
                  <input
                    value={checkoutForm.phone}
                    onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    placeholder="0912 345 678"
                    required
                  />
                </label>
                <label className="span-full">
                  Địa chỉ nhận hàng <span className="req">*</span>
                  <input
                    value={checkoutForm.address}
                    onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    required
                  />
                </label>
              </div>
            </div>

            {/* Khung giao diện thanh toán theo mẫu */}
            <div className="payment-view-wrapper">
              <div className="payment-view-head">
                <h2>Thông tin thanh toán</h2>
                <div className="payment-method-text">
                  Thanh toán: <b>QR - Chuyển khoản đúng số tiền và nội dung</b>
                </div>
                <p className="payment-instruction-sub">
                  Vui lòng quét mã QR bằng ứng dụng ngân hàng và kiểm tra thông tin người nhận trước khi xác nhận
                </p>
              </div>

              <div className="payment-view-grid">
                {/* Cột trái: Mã QR */}
                <div className="payment-view-qr-col">
                  <div className="payment-badge-status">
                    <span>✓</span> Thanh toán bằng mã QR
                  </div>
                  <div className="payment-qr-frame">
                    <img
                      src={`https://img.vietqr.io/image/VBA-4005205409800-qr_only.png?amount=${total}&addInfo=${encodeURIComponent(checkoutCode)}&accountName=${encodeURIComponent('SHOP SACH 77')}`}
                      alt="Mã QR thanh toán"
                      className="payment-qr-square"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(`2|99|4005205409800|SHOP SACH 77||0|0|${total}|${checkoutCode}|transfer_myqr`)}`
                      }}
                    />
                  </div>
                  <div className="payment-qr-caption">Quét QR bằng app ngân hàng</div>
                </div>

                {/* Cột phải: Chi tiết tài khoản */}
                <div className="payment-view-details-col">
                  <div className="payment-field-group">
                    <span className="field-title">Ngân hàng nhận</span>
                    <span className="field-value font-bold">AGRIBANK</span>
                  </div>

                  <div className="payment-field-group">
                    <span className="field-title">Số tài khoản</span>
                    <span className="field-value font-mono">4005205409800</span>
                  </div>

                  <div className="payment-field-group">
                    <span className="field-title">Chủ tài khoản</span>
                    <span className="field-value font-bold">SHOP SACH 77</span>
                  </div>

                  <div className="payment-field-group">
                    <span className="field-title">Số tiền cần thanh toán</span>
                    <span className="field-value amount-highlight">{formatPrice(total)}</span>
                  </div>

                  <div className="payment-field-group">
                    <span className="field-title">Nội dung chuyển khoản</span>
                    <span className="field-value memo-highlight">{checkoutCode}</span>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn & Lưu ý */}
              <div className="payment-view-instructions">
                <div className="instruction-heading">
                  <span className="icon-bulb">💡</span> <b>Cách thanh toán</b>
                </div>
                <ol className="instruction-steps">
                  <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                  <li>Chọn chức năng <b>Quét mã QR</b></li>
                  <li>Quét mã QR bên trên</li>
                  <li>Kiểm tra đúng người nhận và số tiền rồi xác nhận</li>
                </ol>
                <div className="instruction-note-box">
                  <span className="icon-warn">⚠️</span> <b>Lưu ý:</b> Vui lòng chuyển đúng số tiền và kiểm tra đúng thông tin người nhận trước khi xác nhận giao dịch.
                </div>
              </div>

              <div className="payment-view-actions">
                <button
                  type="button"
                  className="primary full btn-order-confirm"
                  onClick={handleCheckoutSubmit}
                >
                  XÁC NHẬN ĐẶT HÀNG & THANH TOÁN
                </button>
                <button
                  type="button"
                  className="btn-order-cancel"
                  onClick={() => setCheckout(false)}
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successOrder && (
        <div className="overlay" onClick={() => setSuccessOrder(null)}>
          <div className="modal success-order-modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setSuccessOrder(null)}><Icon name="close" /></button>
            <div className="success-icon-wrap">
              <svg viewBox="0 0 24 24" className="success-icon" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                <path d="m8 12 3 3 6-6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2>Đặt hàng thành công!</h2>
            <p className="success-subtitle">
              Cảm ơn bạn <b>{successOrder.customerName}</b> đã mua sắm tại <b>SHOP SÁCH 77</b>.
            </p>

            <div className="success-order-card">
              <div className="success-order-code">
                <span>Mã đơn hàng:</span>
                <b>#{successOrder.orderCode}</b>
              </div>
              <div className="success-order-status">
                <span>Trạng thái:</span>
                <span className="status-badge badge-paid">Đã thanh toán qua mã QR</span>
              </div>
              <div className="success-detail-grid">
                <div><small>Phương thức:</small><b>{successOrder.paymentMethod}</b></div>
                <div><small>Số tiền thanh toán:</small><b className="total-highlight">{formatPrice(successOrder.total)}</b></div>
                <div><small>Số điện thoại:</small><b>{successOrder.customerPhone}</b></div>
                <div><small>Thời gian:</small><b>{new Date(successOrder.createdAt).toLocaleString('vi-VN')}</b></div>
                <div className="full-col"><small>Địa chỉ nhận hàng:</small><b>{successOrder.customerAddress}</b></div>
                {successOrder.note && <div className="full-col"><small>Ghi chú:</small><i>{successOrder.note}</i></div>}
              </div>

              <div className="success-books-summary">
                <small><b>Sách đã đặt ({successOrder.items?.length}):</b></small>
                <ul>
                  {successOrder.items?.map(item => (
                    <li key={item.id}>
                      <span>{item.title} × {item.qty}</span>
                      <b>{formatPrice(item.price * item.qty)}</b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="success-notice">
              💬 Hệ thống đã ghi nhận thanh toán qua mã QR cho đơn <b>#{successOrder.orderCode}</b> (Số tiền: <b>{formatPrice(successOrder.total)}</b>). Cửa hàng sẽ đóng gói sách và giao đến bạn sớm nhất!
            </div>

            <div className="success-actions">
              <button className="primary full" onClick={() => setSuccessOrder(null)}>
                TIẾP TỤC MUA SÁCH
              </button>
            </div>
          </div>
        </div>
      )}

      {myOrdersOpen && (
        <div className="overlay" onClick={() => setMyOrdersOpen(false)}>
          <div className="modal my-orders-modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setMyOrdersOpen(false)}><Icon name="close" /></button>
            <span className="eyebrow">TÀI KHOẢN</span>
            <h2>Đơn hàng của tôi</h2>
            <p>Lịch sử các đơn hàng bạn đã đặt tại SHOP SÁCH 77.</p>

            {userOrders.length ? (
              <div className="user-orders-list">
                {userOrders.map(order => (
                  <div className="user-order-card" key={order.id}>
                    <div className="user-order-header">
                      <div>
                        <strong>Đơn hàng #{order.orderCode || order.id}</strong>
                        <small>{new Date(order.createdAt).toLocaleString('vi-VN')}</small>
                      </div>
                      <span className={`status-badge ${order.paymentStatus?.includes('xác nhận') || order.paymentStatus?.includes('Hoàn') ? 'badge-paid' : 'badge-pending'}`}>
                        {order.paymentStatus || 'Chờ xác nhận'}
                      </span>
                    </div>
                    <div className="user-order-items">
                      {order.items?.map(item => (
                        <div className="user-order-item" key={item.id}>
                          <img src={item.img} alt="" />
                          <span>{item.title} <b>x{item.qty}</b></span>
                          <em>{formatPrice(item.price * item.qty)}</em>
                        </div>
                      ))}
                    </div>
                    <div className="user-order-footer">
                      <div>
                        <small>Phương thức: </small>
                        <b>{order.paymentMethod || 'Chuyển khoản QR'}</b>
                      </div>
                      <div className="user-order-total">
                        <span>Tổng thanh toán:</span>
                        <b>{formatPrice(order.total)}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cart-empty">
                <div>📦</div>
                <p>Bạn chưa có đơn hàng nào.</p>
                <button className="primary" onClick={() => setMyOrdersOpen(false)}>MUA SẮM NGAY</button>
              </div>
            )}
          </div>
        </div>
      )}

      {borrowOpen && <div className="overlay" onClick={() => setBorrowOpen(false)}><div className="modal borrow-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setBorrowOpen(false)}><Icon name="close" /></button><span className="eyebrow">FR-02 · PHIẾU MƯỢN</span><h2>Lập phiếu mượn sách</h2><form onSubmit={handleBorrowSubmit} className="borrow-form"><div className="borrow-form-fields"><label>Họ tên người mượn<input value={borrowForm.memberName} onChange={e => setBorrowForm({ ...borrowForm, memberName: e.target.value })} placeholder="Nguyễn Văn A" /></label><label>Email<input type="email" value={borrowForm.memberEmail} onChange={e => setBorrowForm({ ...borrowForm, memberEmail: e.target.value })} placeholder="email@example.com" /></label><label>Hạn trả<input type="date" value={borrowForm.dueDate} onChange={e => setBorrowForm({ ...borrowForm, dueDate: e.target.value })} /></label></div><div className="borrow-book-picker"><h3>Chọn sách còn trong kho</h3><div className="borrow-book-list">{products.filter(product => !product.hidden && (product.stock ?? 0) > 0).map(product => <button type="button" className="borrow-book-option" key={product.id} onClick={() => addBorrowBook(product)}><img src={product.img} alt={product.title} /><span><b>{product.title}</b><small>Còn {product.stock} cuốn</small></span><strong>+</strong></button>)}</div></div><div className="borrow-selected"><h3>Sách trong phiếu ({borrowItems.length})</h3>{borrowItems.length ? borrowItems.map(item => <div className="borrow-selected-item" key={item.id}><span>{item.title}</span><div><button type="button" onClick={() => changeBorrowQty(item.id, -1)}>-</button><b>{item.qty}</b><button type="button" onClick={() => changeBorrowQty(item.id, 1)}>+</button></div></div>) : <p>Chưa chọn sách.</p>}</div><button className="primary full" type="submit">LƯU PHIẾU MƯỢN</button></form></div></div>}

      {authOpen && <div className="overlay" onClick={() => setAuthOpen(false)}><div className="modal auth-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setAuthOpen(false)}><Icon name="close" /></button><span className="eyebrow">{authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</span><h2>{authMode === 'login' ? 'Chào mừng quay lại' : 'Tạo tài khoản mới'}</h2><form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="auth-form">
        {authMode === 'register' && <label>Họ và tên<input value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Nguyễn Văn A" /></label>}
        <label>Email<input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="abc@gmail.com" /></label>
        <label>Mật khẩu<input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="••••••••" /></label>
        <button type="submit" className="primary full">{authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}</button>
        <button type="button" className="auth-switch" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}</button>
      </form></div></div>}

      {adminOpen && currentUser?.role === 'admin' && <div className="overlay" onClick={() => setAdminOpen(false)}><div className="modal admin-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setAdminOpen(false)}><Icon name="close" /></button><span className="eyebrow">ADMIN</span><h2>Quản lý website</h2><div className="admin-grid">
        <div className="admin-box">
          <h3>Thống kê</h3>
          <p>Tổng khách hàng: <b>{users.filter(u => u.role === 'customer').length}</b></p>
          <p>Tổng đơn hàng: <b>{orders.length}</b></p>
          <p>Doanh thu: <b>{formatPrice(orders.reduce((sum, item) => sum + Number(item.total || 0), 0))}</b></p>
          <p>Phiếu mượn đang lập: <b>{borrowSlips.filter(slip => slip.status === 'Đang mượn').length}</b></p>
          <button className="primary full borrow-open-button" onClick={() => { setAdminOpen(false); setBorrowOpen(true) }}>+ LẬP PHIẾU MƯỢN SÁCH</button>
        </div>

        <div className="admin-box full-width">
          <h3>{editingProductId !== null ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h3>
          <form className="admin-product-form" onSubmit={handleAddProduct}>
            <div className="admin-form-grid">
              <label>Tên sách<input value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} placeholder="Nhập tên sách" /></label>
              <label>Tác giả<input value={productForm.author} onChange={e => setProductForm({ ...productForm, author: e.target.value })} placeholder="Nhập tên tác giả" /></label>
              <label>Thể loại<select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>{categories.filter(item => item !== 'Tất cả').map(item => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Badge<input value={productForm.badge} onChange={e => setProductForm({ ...productForm, badge: e.target.value })} placeholder="Mới / Bán chạy" /></label>
              <label>Giá bán<input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="79000" /></label>
              <label>Giá cũ<input type="number" value={productForm.oldPrice} onChange={e => setProductForm({ ...productForm, oldPrice: e.target.value })} placeholder="99000" /></label>
              <label>Số lượng tồn<input type="number" min="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} placeholder="5" /></label>
              <label className="full-width-input">Ảnh (URL)<input value={productForm.img} onChange={e => setProductForm({ ...productForm, img: e.target.value })} placeholder="https://..." /></label>
            </div>
            {productForm.img && <img className="admin-preview" src={productForm.img} alt="Preview" />}
            <div className="admin-form-actions">
              <button type="submit" className="primary full">{editingProductId !== null ? 'LƯU THAY ĐỔI' : 'THÊM SÁCH'}</button>
              {editingProductId !== null && <button type="button" className="secondary-btn" onClick={resetProductForm}>HỦY</button>}
            </div>
          </form>
        </div>

        <div className="admin-box full-width">
          <h3>Quản lý sản phẩm</h3>
          <div className="admin-product-list">
            {products.map(product => (
              <div className="admin-product" key={product.id}>
                <img src={product.img} alt={product.title} className="admin-product-thumb" />
                <div className="admin-product-info">
                  <strong>{product.title}</strong>
                  <small>{product.category} • Còn {product.stock ?? 0} cuốn • {product.hidden ? 'Đang ẩn' : 'Đang hiển thị'}</small>
                </div>
                <div className="admin-product-actions">
                  <button onClick={() => handleEditProduct(product)}>Sửa</button>
                  <button onClick={() => toggleProductHidden(product.id)}>{product.hidden ? 'Hiển thị' : 'Ẩn'}</button>
                  <button className="danger" onClick={() => handleDeleteProduct(product.id)}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-box full-width">
          <h3>Danh sách phiếu mượn</h3>
          {borrowSlips.length ? borrowSlips.map(slip => <div className="order-item" key={slip.id}><strong>{slip.id}<small>{slip.memberName} · Hạn trả {slip.dueDate}</small></strong><span>{slip.items.map(item => `${item.title} x${item.qty}`).join(', ')}</span><b>{slip.status}</b></div>) : <p>Chưa có phiếu mượn nào.</p>}
        </div>

        <div className="admin-box full-width">
          <div className="admin-box-header-row">
            <h3>Danh sách đơn hàng ({orders.length})</h3>
            <small className="admin-subtitle">Quản lý và xác nhận chuyển khoản ngân hàng</small>
          </div>
          {orders.length ? (
            <div className="admin-orders-grid">
              {orders.map(order => (
                <div className="admin-order-card" key={order.id}>
                  <div className="admin-order-top">
                    <div>
                      <span className="order-code-badge">#{order.orderCode || order.id}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="order-status-actions">
                      <span className={`status-badge ${order.paymentStatus === 'Đã xác nhận thanh toán' || order.paymentStatus === 'Hoàn tất'
                        ? 'badge-paid'
                        : 'badge-pending'
                        }`}>
                        {order.paymentStatus || 'Chờ xác nhận'}
                      </span>
                      <select
                        value={order.paymentStatus || 'Chờ xác nhận chuyển khoản'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Chờ xác nhận chuyển khoản">Chờ xác nhận chuyển khoản</option>
                        <option value="Đã xác nhận thanh toán">Đã xác nhận thanh toán</option>
                        <option value="Đang giao hàng">Đang giao hàng</option>
                        <option value="Hoàn tất">Hoàn tất</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                      <button
                        type="button"
                        className="btn-delete-order"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Xóa đơn hàng"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="admin-order-customer">
                    <div><b>Khách:</b> {order.customerName} ({order.customerEmail})</div>
                    {order.customerPhone && <div><b>SĐT:</b> {order.customerPhone}</div>}
                    {order.customerAddress && <div><b>Địa chỉ:</b> {order.customerAddress}</div>}
                    {order.note && <div><b>Ghi chú:</b> <i>{order.note}</i></div>}
                  </div>

                  <div className="admin-order-items-preview">
                    <b>Sách đặt ({order.items?.length || 0}):</b> {order.items?.map(item => `${item.title} (x${item.qty})`).join(', ')}
                  </div>

                  <div className="admin-order-bottom">
                    <span className="payment-method-tag">
                      <Icon name="qr" /> {order.paymentMethod || 'Chuyển khoản QR'}
                    </span>
                    <div className="admin-order-total">
                      Tổng tiền: <b>{formatPrice(order.total)}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Chưa có đơn hàng nào.</p>
          )}
        </div>
      </div></div></div>}
    </div>
  )
}

export default App
