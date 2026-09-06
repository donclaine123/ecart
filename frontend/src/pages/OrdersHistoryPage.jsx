import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, Clock } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function OrdersHistoryPage() {
  const { orders, fetchOrders } = useCart()

  useEffect(() => {
    fetchOrders?.()
  }, [fetchOrders])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Invoices</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review previous purchases, real-time shipment status, and snapshot receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No orders placed yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you complete a purchase, your receipt invoices will be permanently snapshotted here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors mt-2"
          >
            Start Shopping
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-slate-900">{order.order_number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                      {order.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      {order.payment_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Total Amount</span>
                  <span className="text-sm font-bold text-slate-900">${order.total_amount.toFixed(0)}</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate max-w-md">
                      {item.product_name} <span className="text-slate-400">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-slate-900">${item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/order-success/${order.order_number}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View Receipt
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
