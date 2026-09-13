import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Critical routes eagerly loaded for instant initial storefront view
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ScrollToTop from './components/common/ScrollToTop'

// Route-level code-splitting for non-critical views (lazy-loaded on demand)
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrdersHistoryPage = lazy(() => import('./pages/OrdersHistoryPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const OurStoryPage = lazy(() => import('./pages/about/OurStoryPage'))
const CareersPage = lazy(() => import('./pages/about/CareersPage'))
const SustainabilityPage = lazy(() => import('./pages/about/SustainabilityPage'))
const ContactUsPage = lazy(() => import('./pages/support/ContactUsPage'))
const ShippingReturnsPage = lazy(() => import('./pages/support/ShippingReturnsPage'))
const FaqPage = lazy(() => import('./pages/support/FaqPage'))

// Admin Components
import AdminRoute from './components/common/AdminRoute'
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )
}

// Storefront Layout with Store Navbar & Footer
function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Storefront Layout (Public & Customer Views) */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="/account/orders" element={<OrdersHistoryPage />} />
                <Route path="/account/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/our-story" element={<OurStoryPage />} />
                <Route path="/about" element={<OurStoryPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
                <Route path="/faq" element={<FaqPage />} />
              </Route>

              {/* Completely Standalone Admin Portal (NO Storefront Navbar or Footer) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
