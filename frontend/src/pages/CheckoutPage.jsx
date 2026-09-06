import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, ShieldCheck, CreditCard, ArrowRight, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CheckoutPage() {
  const { items, subtotal, shippingCost, totalAmount, placeMockOrder } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    postal_code: '97477',
    country: 'United States',
    phone: '+1 (555) 019-2834',
  })
  const [paymentGateway, setPaymentGateway] = useState('mock')

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No items to checkout</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const order = await placeMockOrder(formData)
      navigate(`/order-success/${order.order_number}`)
    } catch (err) {
      setError(err.message || 'Failed to process order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order with verified server-side stock reservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Delivery Form & Payment */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {!isAuthenticated && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between gap-4">
              <div className="text-xs text-indigo-900">
                <span className="font-bold">Have an account? </span>
                Sign in to save this order to your history and sync your profile.
              </div>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Truck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">1. Delivery Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">2. Payment Pipeline</h2>
            </div>

            <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${paymentGateway === 'mock' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="gateway"
                  value="mock"
                  checked={paymentGateway === 'mock'}
                  onChange={() => setPaymentGateway('mock')}
                  className="mt-1 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Phase 1: Instant Mock Payment</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Step 6 Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Executes atomic database transaction simulation, row-level locking, stock decrements, and creates immutable order item snapshots.
                  </p>
                </div>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Processing Transaction...
              </span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Complete Purchase (${totalAmount.toFixed(0)})
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Snapshot Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Order Items ({items.length})</h3>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  ${(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `$${shippingCost.toFixed(0)}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${totalAmount.toFixed(0)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
