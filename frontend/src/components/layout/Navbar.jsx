import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, LogOut, Menu, X, ArrowRight, Shield, MapPin } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../common/BrandLogo'

export default function Navbar() {
  const { totalItemsCount } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      {/* Top Accent Stripe */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <BrandLogo size="md" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <Link to="/shop?category=smartphones" className="hover:text-slate-900 transition-colors">
              Smartphones
            </Link>
            <Link to="/shop?category=laptops" className="hover:text-slate-900 transition-colors">
              Laptops
            </Link>
            <Link to="/shop?category=audio" className="hover:text-slate-900 transition-colors">
              Audio
            </Link>
            <Link to="/shop?category=wearables" className="hover:text-slate-900 transition-colors">
              Wearables
            </Link>
            <Link to="/shop?category=accessories" className="hover:text-slate-900 transition-colors">
              Accessories
            </Link>
            <Link to="/shop" className="hover:text-slate-900 transition-colors">
              Deals
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 text-slate-600">
            <Link
              to="/shop"
              aria-label="Search"
              className="p-2 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>


            {/* Cart Icon with Live Counter */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute 0.5 top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline-block max-w-[90px] truncate">{user?.name}</span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 text-xs"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">{user?.name}</p>
                          {user?.role === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider border border-emerald-200">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 truncate">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <div className="py-1 border-b border-slate-100">
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold"
                          >
                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                            Admin Console
                          </Link>
                        </div>
                      )}
                      <div className="py-1">
                        <Link
                          to="/account/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          Profile & Address
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                          Order Invoices
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUserDropdownOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium text-left cursor-pointer transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2">
            <Link
              to="/shop?category=smartphones"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Smartphones
            </Link>
            <Link
              to="/shop?category=laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Laptops
            </Link>
            <Link
              to="/shop?category=audio"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Audio
            </Link>
            <Link
              to="/shop?category=wearables"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Wearables
            </Link>
            <Link
              to="/shop?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Accessories
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Deals
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
