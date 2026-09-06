import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, totalItemsCount, subtotal, shippingCost, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your shopping cart is empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our collection of flagship phones, ultrabooks, and noise-cancelling headphones.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors mt-3"
        >
          Explore Storefront
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Line Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                />
                <div>
                  <Link to={`/product/${item.slug}`} className="hover:text-indigo-600 transition-colors">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</h3>
                  </Link>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    ${parseFloat(item.price).toFixed(0)} each
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock_quantity}
                    className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-sm font-bold text-slate-900">
                    ${(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Server-side price authority protects your order from price tampering.</span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900">Order Summary</h2>

          <div className="space-y-3 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span>Subtotal ({totalItemsCount} items)</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Standard 2-Day Shipping</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="font-semibold text-emerald-600">FREE</span>
                ) : (
                  `$${shippingCost.toFixed(0)}`
                )}
              </span>
            </div>
            {shippingCost > 0 && (
              <p className="text-[11px] text-indigo-600 font-medium">
                Add ${(50 - subtotal).toFixed(0)} more for free delivery!
              </p>
            )}
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-slate-600">Total</span>
            <span className="text-2xl font-extrabold text-slate-900">
              ${totalAmount.toFixed(0)}
            </span>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shop"
            className="w-full block text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
