import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Lock, ShieldCheck, CreditCard, ArrowRight, Truck, Zap, MapPin, Edit3, X, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StripeCardSection from '../components/checkout/StripeCardSection'
import { SupportedCardIcons } from '../components/checkout/CardBrandIcons'

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    shippingCost,
    totalAmount,
    createStripePaymentIntent,
    placeStripeOrder,
  } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Direct checkout without needing to add to cart
  const directItem = location.state?.directItem || null

  const activeItems = directItem
    ? [
        {
          id: 'direct-' + directItem.product.id,
          product_id: directItem.product.id,
          name: directItem.product.name,
          price: directItem.product.price,
          quantity: directItem.quantity,
          image_url: directItem.product.image_url,
        },
      ]
    : items

  const activeSubtotal = directItem
    ? (parseFloat(directItem.product.price) || 0) * directItem.quantity
    : subtotal

  const activeShipping = directItem
    ? (activeSubtotal > 50 ? 0 : 15.00)
    : shippingCost

  const activeTotal = activeSubtotal + activeShipping

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    phone: user?.phone || '',
  })
  
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [publishableKey, setPublishableKey] = useState('')
  const [cardHandler, setCardHandler] = useState(null)
  const [cardError, setCardError] = useState('')
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)

  const isAddressComplete = Boolean(
    formData.name?.trim() &&
    formData.address?.trim() &&
    formData.city?.trim() &&
    formData.state?.trim() &&
    formData.postal_code?.trim() &&
    formData.country?.trim() &&
    formData.phone?.trim()
  )

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        name: prev.name || user.name || '',
        email: user.email || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        postal_code: prev.postal_code || user.postal_code || '',
        country: prev.country || user.country || '',
        phone: prev.phone || user.phone || '',
      }))
    }
  }, [user])

  const [checkoutStep, setCheckoutStep] = useState('')
  const prefetchingRef = useRef(false)

  // Prefetch Stripe PaymentIntent when user is ready to checkout
  useEffect(() => {
    let active = true
    if (activeItems.length > 0 && isAuthenticated && !clientSecret && !prefetchingRef.current) {
      prefetchingRef.current = true
      const directPayload = directItem
        ? { product_id: directItem.product.id, quantity: directItem.quantity }
        : null

      createStripePaymentIntent(directPayload)
        .then((data) => {
          if (active && data) {
            setClientSecret(data.clientSecret)
            setPaymentIntentId(data.paymentIntentId)
            setPublishableKey(data.publishableKey)
          }
        })
        .catch((err) => {
          prefetchingRef.current = false
          if (active) {
            console.warn('Failed to prefetch Stripe intent:', err)
          }
        })
    }
    return () => {
      active = false
    }
  }, [activeItems.length, isAuthenticated, clientSecret, createStripePaymentIntent, directItem])

  if (activeItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No items to checkout</h2>
        <p className="text-xs text-slate-500">Please choose a product to proceed with checkout.</p>
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
    setCardError('')

    // Validate complete delivery details
    if (!formData.name?.trim() || !formData.address?.trim() || !formData.city?.trim() || !formData.postal_code?.trim() || !formData.country?.trim() || !formData.phone?.trim()) {
      setError('Please complete your delivery details before placing the order.')
      setIsDeliveryModalOpen(true)
      setLoading(false)
      return
    }

    try {
      setCheckoutStep('Verifying card details...')
      // Pre-validate card input fields before starting transaction
      if (cardHandler && cardHandler.validate) {
        const valError = cardHandler.validate()
        if (valError) {
          setCardError(valError)
          setError(valError)
          setLoading(false)
          setCheckoutStep('')
          return
        }
      }

      let activeSecret = clientSecret
      let activeIntentId = paymentIntentId
      const directPayload = directItem
        ? { product_id: directItem.product.id, quantity: directItem.quantity }
        : null

      // If intent wasn't fetched yet, fetch now
      if (!activeSecret) {
        setCheckoutStep('Preparing payment session...')
        const intentData = await createStripePaymentIntent(directPayload)
        activeSecret = intentData.clientSecret
        activeIntentId = intentData.paymentIntentId
        setClientSecret(activeSecret)
        setPaymentIntentId(activeIntentId)
      }

      // Confirm card payment
      setCheckoutStep('Authorizing payment...')
      let confirmedId = activeIntentId
      if (cardHandler && cardHandler.confirmPayment) {
        const confirmRes = await cardHandler.confirmPayment(activeSecret)
        if (confirmRes?.error) {
          const msg = confirmRes.error.message || 'Payment confirmation failed with card provider.'
          setCardError(msg)
          throw new Error(msg)
        }
        if (confirmRes?.paymentIntent?.id) {
          confirmedId = confirmRes.paymentIntent.id
        }
      }

      // Finalize order atomically in database
      setCheckoutStep('Creating order record...')
      const order = await placeStripeOrder(formData, confirmedId, directPayload)
      navigate(`/order-success/${order.order_number}`)
    } catch (err) {
      setError(err.message || 'Failed to process order. Please try again.')
    } finally {
      setLoading(false)
      setCheckoutStep('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
          {directItem && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800">
              <Zap className="w-3 h-3 text-indigo-600" />
              Express Buy Now
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order with verified server-side stock reservation and secure payment.
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

          {/* Delivery Address Summary Card (Minimized) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">1. Delivery Destination</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isAddressComplete ? 'Change Address' : 'Add Address'}
              </button>
            </div>

            {isAddressComplete ? (
              <div
                onClick={() => setIsDeliveryModalOpen(true)}
                className="group cursor-pointer p-4 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{formData.name}</span>
                      <span className="text-[11px] text-slate-300">•</span>
                      <span className="text-xs text-slate-600">{formData.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {formData.address}, {formData.city}, {formData.state} {formData.postal_code}, {formData.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{formData.email}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded font-medium">Locked</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-indigo-600 font-medium transition-colors pt-0.5 shrink-0">
                    <span>Edit</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsDeliveryModalOpen(true)}
                className="cursor-pointer p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 text-center transition-all group"
              >
                <MapPin className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
                <p className="text-xs font-semibold text-slate-800">No delivery destination set</p>
                <p className="text-[11px] text-slate-500 mt-1">Click to enter your name, address, and contact number</p>
                <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-white border border-indigo-100 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  Enter Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">2. Payment Method</h2>
              </div>
              <SupportedCardIcons size="sm" />
            </div>

            <p className="text-xs text-slate-500">
              Transactions are encrypted and processed securely. Enter your card information below to complete your order.
            </p>

            <StripeCardSection
              publishableKey={publishableKey}
              onCardReady={(handler) => setCardHandler(handler)}
              error={cardError}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {checkoutStep || 'Processing Order...'}
              </span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Pay with Card (${activeTotal.toFixed(0)})
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Snapshot Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Order Items ({activeItems.length})</h3>
            {directItem && (
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Direct Buy
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {activeItems.map((item) => (
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
              <span className="font-semibold text-slate-900">${activeSubtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{activeShipping === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `$${activeShipping.toFixed(0)}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${activeTotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-bit SSL encrypted checkout</span>
          </div>
        </div>
      </div>

      {/* Full View Delivery Details Modal */}
      {isDeliveryModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsDeliveryModalOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delivery Information</h3>
                  <p className="text-[11px] text-slate-500">Enter where your order should be delivered</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alexander Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Email Address</label>
                    {isAuthenticated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Lock className="w-2.5 h-2.5 text-slate-400" /> Account Locked
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={isAuthenticated ? undefined : handleChange}
                    readOnly={isAuthenticated}
                    disabled={isAuthenticated}
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                      isAuthenticated
                        ? 'bg-slate-100/80 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 123 Waterfront Way, Apt 4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Portland"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. OR"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      placeholder="e.g. 97201"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g. United States"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              {isAuthenticated ? (
                <Link
                  to="/account/profile"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Manage Saved Profile
                </Link>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setIsDeliveryModalOpen(false)
                  }}
                  className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
