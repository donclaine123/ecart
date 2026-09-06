import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../api/axios'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ecart_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('ecart_orders')
      return savedOrders ? JSON.parse(savedOrders) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('ecart_cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('ecart_orders', JSON.stringify(orders))
  }, [orders])

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > 50 || items.length === 0 ? 0 : 15.00
  const totalAmount = subtotal + shippingCost

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock_quantity)
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        )
      } else {
        const initialQty = Math.min(quantity, product.stock_quantity)
        return [
          ...prev,
          {
            id: product.id,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image_url: product.image_url,
            stock_quantity: product.stock_quantity,
            sku: product.sku,
            category_name: product.category_name,
            quantity: initialQty,
          },
        ]
      }
    })
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const clamped = Math.min(newQuantity, item.stock_quantity)
          return { ...item, quantity: clamped }
        }
        return item
      })
    )
  }

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const placeMockOrder = async (shippingAddress) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `ORD-2026-${randomSuffix}`

    const newOrder = {
      id: Date.now(),
      order_number: orderNumber,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping_cost: parseFloat(shippingCost.toFixed(2)),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      status: 'processing',
      payment_status: 'paid',
      gateway: 'mock',
      shipping_address: shippingAddress,
      items: items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
        image_url: item.image_url,
      })),
      created_at: new Date().toISOString(),
    }

    try {
      if (isAuthenticated) {
        await api.post('/orders', {
          shipping_address: shippingAddress,
          gateway: 'mock',
        })
      }
    } catch {
      // fallback to mock order snapshot
    }

    setOrders((prev) => [newOrder, ...prev])
    clearCart()
    return newOrder
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        shippingCost,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        placeMockOrder,
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
