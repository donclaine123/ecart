import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldAlert } from 'lucide-react'

export default function AdminRoute() {
  const { user, isAuthenticated, isAdmin, initializing } = useAuth()

  if (initializing && !user) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account ({user?.email}) does not have administrative privileges to access this portal.
        </p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Return to Storefront
        </a>
      </div>
    )
  }

  return <Outlet />
}
