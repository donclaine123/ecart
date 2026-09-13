import { useState, useEffect, useCallback } from 'react'
import { Eye, X, ShoppingBag, MapPin, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_orders')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [statusError, setStatusError] = useState('')

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' },
  ]

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.get('/admin/orders')
      const orderList = res.data?.data || res.data || []
      const finalOrders = Array.isArray(orderList) ? orderList : []
      setOrders(finalOrders)
      try {
        localStorage.setItem('ecart_admin_orders', JSON.stringify(finalOrders))
      } catch {}
    } catch (err) {
      console.error('Failed to load admin orders:', err)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId)
    setStatusError('')
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update order status.')
    } finally {
      setStatusUpdating(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Order Fulfillment Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer checkout snapshots, inspect shipping destinations, and update delivery status.
        </p>
      </div>

      {statusError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusError}</span>
          </div>
          <button
            onClick={() => setStatusError('')}
            className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
            <p>No orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Order Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date Placed</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      {o.order_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{o.user?.name || 'Customer'}</p>
                      <span className="text-[11px] text-slate-400">{o.user?.email}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${parseFloat(o.total_amount || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        disabled={statusUpdating === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer disabled:opacity-50"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View order snapshot"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-6 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  {selectedOrder.order_number}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Order Invoice Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shipping Destination */}
            {selectedOrder.shipping_address_json && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed pl-5.5">
                  <p className="font-semibold text-slate-800">
                    {selectedOrder.shipping_address_json.name} ({selectedOrder.shipping_address_json.phone})
                  </p>
                  <p>{selectedOrder.shipping_address_json.address}</p>
                  <p>
                    {selectedOrder.shipping_address_json.city}, {selectedOrder.shipping_address_json.state}{' '}
                    {selectedOrder.shipping_address_json.postal_code},{' '}
                    {selectedOrder.shipping_address_json.country}
                  </p>
                </div>
              </div>
            )}

            {/* Line Items Snapshot */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Permanent Line Item Snapshot
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-4 bg-slate-50/50 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <p className="text-[11px] text-slate-400">
                        ${parseFloat(item.unit_price || 0).toFixed(0)} &times; {item.quantity} unit
                        {item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${parseFloat(item.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <div className="w-56 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${parseFloat(selectedOrder.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {parseFloat(selectedOrder.shipping_cost || 0) === 0
                      ? 'FREE'
                      : `$${parseFloat(selectedOrder.shipping_cost || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">
                    ${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
