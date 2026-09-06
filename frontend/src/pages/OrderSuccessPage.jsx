import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

export default function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const { orders } = useCart()
  const [copied, setCopied] = useState(false)
  const [fetchedOrder, setFetchedOrder] = useState(null)

  useEffect(() => {
    const memoryOrder = orders.find((o) => o.order_number === orderNumber)
    if (!memoryOrder && orderNumber) {
      api.get(`/orders/${orderNumber}`)
        .then((res) => {
          if (res.data) setFetchedOrder(res.data)
        })
        .catch(() => {})
    }
  }, [orderNumber, orders])

  const order = orders.find((o) => o.order_number === orderNumber) || fetchedOrder || orders[0]

  const handleCopy = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Top Box */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Order Confirmed</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Thank You for Your Order!</h1>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Your transaction completed successfully and inventory records have been safely updated.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500">Order Reference:</span>
          <span className="font-mono font-bold text-xs text-slate-900">{order?.order_number || orderNumber}</span>
          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            title="Copy order number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Snapshot Receipt Details */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Placed On</span>
              <p className="text-xs font-semibold text-slate-900">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                Status: {order.status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                Payment: {order.payment_status}
              </span>
            </div>
          </div>

          {/* Line items snapshot */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Permanent Invoice Item Snapshot
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-100"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">
                        ${item.unit_price.toFixed(0)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">${item.subtotal.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900">${order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-slate-900">
                  {order.shipping_cost === 0 ? 'FREE' : `$${order.shipping_cost.toFixed(0)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-slate-900">${order.total_amount.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          Continue Shopping
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/account/orders"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          View All Invoices
        </Link>
      </div>
    </div>
  )
}
