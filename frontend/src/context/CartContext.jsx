import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth()

  // 1. Instantaneous 0ms initialization from account-scoped cache
  const [items, setItems] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ecart_user')
      const parsed = savedUser ? JSON.parse(savedUser) : null
      if (parsed?.id) {
        const cached = localStorage.getItem(`ecart_cart_user_${parsed.id}`)
        return cached ? JSON.parse(cached) : []
      }
      return []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState([])

  // Keep account-scoped cache in sync with local state
  useEffect(() => {
    if (user?.id) {
      if (items.length > 0) {
        localStorage.setItem(`ecart_cart_user_${user.id}`, JSON.stringify(items))
      } else {
        localStorage.removeItem(`ecart_cart_user_${user.id}`)
      }
    }
  }, [items, user?.id])

  // Fetch user's persistent cart from the database (Silent Background Revalidation)
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      const res = await api.get('/cart')
      if (res.data?.items) {
        setItems(res.data.items)
        if (user?.id) {
          localStorage.setItem(`ecart_cart_user_${user.id}`, JSON.stringify(res.data.items))
        }
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Fetch user's order history from the database
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([])
      return
    }

    try {
      const res = await api.get('/orders')
      const orderList = res.data?.data || res.data || []
      setOrders(orderList)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }, [isAuthenticated])

  // Sync cart and orders when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
      fetchOrders()
    } else {
      // Clear cart on logout: Cart is an account-specific save point!
      setItems([])
      setOrders([])
      if (user?.id) {
        localStorage.removeItem(`ecart_cart_user_${user.id}`)
      }
      localStorage.removeItem('ecart_cart')
    }
  }, [isAuthenticated, fetchCart, fetchOrders, user?.id])

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 0), 0)
  const shippingCost = subtotal > 50 || items.length === 0 ? 0 : 15.00
  const totalAmount = subtotal + shippingCost

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      return {
        success: false,
        requireAuth: true,
        message: 'Please log in to add items to your cart.',
      }
    }

    const previousItems = [...items]

    // 1. Instant 0ms Optimistic Update (Immediate badge & UI response)
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.product_id === product.id || item.id === product.id
      )
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id || item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...prev,
        {
          id: 'temp-' + Date.now(),
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: parseFloat(product.price),
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          quantity,
          subtotal: parseFloat(product.price) * quantity,
        },
      ]
    })

    // 2. Single network request to persist on server and receive canonical cart
    try {
      const res = await api.post('/cart/items', {
        product_id: product.id,
        quantity,
      })
      if (res.data?.cart?.items) {
        setItems(res.data.cart.items)
      }
      return { success: true }
    } catch (err) {
      // Rollback on failure (e.g., out of stock)
      setItems(previousItems)
      const msg = err.response?.data?.message || 'Failed to add item to cart.'
      return { success: false, error: msg }
    }
  }

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      return await removeFromCart(cartItemId)
    }

    const previousItems = [...items]

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    )

    if (isAuthenticated) {
      try {
        const res = await api.patch(`/cart/items/${cartItemId}`, { quantity: newQuantity })
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items)
        }
      } catch (err) {
        setItems(previousItems)
        console.error('Failed to update cart quantity:', err)
      }
    }
  }

  const removeFromCart = async (cartItemId) => {
    const previousItems = [...items]

    // Optimistic UI update
    setItems((prev) => prev.filter((item) => item.id !== cartItemId))

    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/items/${cartItemId}`)
        if (res.data?.cart?.items) {
          setItems(res.data.cart.items)
        }
      } catch (err) {
        setItems(previousItems)
        console.error('Failed to delete cart item:', err)
      }
    }
  }

  const clearCart = async () => {
    setItems([])
    if (isAuthenticated) {
      try {
        await api.delete('/cart')
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
    }
  }

  const placeMockOrder = async (shippingAddress) => {
    try {
      const res = await api.post('/orders', {
        shipping_address: shippingAddress,
        gateway: 'mock',
      })

      if (res.data?.order) {
        setOrders((prev) => [res.data.order, ...prev])
        setItems([])
        return res.data.order
      }
      throw new Error('No order returned from server.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order.'
      throw new Error(msg)
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        shippingCost,
        totalAmount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeMockOrder,
        fetchCart,
        fetchOrders,
        orders,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
