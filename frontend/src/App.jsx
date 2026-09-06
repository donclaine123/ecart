import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersHistoryPage from './pages/OrdersHistoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OurStoryPage from './pages/about/OurStoryPage'
import CareersPage from './pages/about/CareersPage'
import SustainabilityPage from './pages/about/SustainabilityPage'
import ContactUsPage from './pages/support/ContactUsPage'
import ShippingReturnsPage from './pages/support/ShippingReturnsPage'
import FaqPage from './pages/support/FaqPage'
import ScrollToTop from './components/common/ScrollToTop'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                <Route path="/account/orders" element={<OrdersHistoryPage />} />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
