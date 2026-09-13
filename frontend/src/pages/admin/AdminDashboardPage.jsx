import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, AlertTriangle, ArrowRight, Package, TrendingUp } from 'lucide-react'
import api from '../../api/axios'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_stats')
      return cached ? JSON.parse(cached) : {
        total_revenue: 0,
        total_orders: 0,
        low_stock_products_count: 0,
      }
    } catch {
      return {
        total_revenue: 0,
        total_orders: 0,
        low_stock_products_count: 0,
      }
    }
  })
  const [recentOrders, setRecentOrders] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_recent_orders')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/dashboard/stats').catch(() => ({ data: null })),
          api.get('/admin/orders').catch(() => ({ data: null })),
        ])

        if (isMounted) {
          if (statsRes.data) {
            setStats(statsRes.data)
            try {
              localStorage.setItem('ecart_admin_stats', JSON.stringify(statsRes.data))
            } catch {}
          }
          if (ordersRes.data?.data) {
            const list = ordersRes.data.data.slice(0, 5)
            setRecentOrders(list)
            try {
              localStorage.setItem('ecart_admin_recent_orders', JSON.stringify(list))
            } catch {}
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Operations Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue metrics, inventory health warnings, and transactional checkout activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Package className="w-3.5 h-3.5" />
            Manage Inventory
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              ${parseFloat(stats.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Verified settled payments
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.total_orders || 0}
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">Recorded in database</p>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {stats.low_stock_products_count || 0}
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Items with &le; 8 units remaining</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Queue Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Customer Checkouts</h3>
            <p className="text-[11px] text-slate-400">Snapshot receipts saved with pessimistic row locks.</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            Open Queue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No customer orders placed yet.</div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900">{order.order_number}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {order.user?.name} &bull; {order.user?.email}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                    {order.status}
                  </span>
                  <span className="font-bold text-slate-900">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
