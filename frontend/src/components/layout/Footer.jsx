import { Truck, ShieldCheck, RotateCcw, Headset, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white text-slate-500 text-xs">
      {/* Feature Value Props Strip */}
      <div className="bg-slate-50/80 border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free 2-Day Shipping</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">On all orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">2-Year Official Warranty</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Guaranteed protection</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">30-Day Money-Back</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">No questions asked</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 shrink-0">
              <Headset className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">24/7 Tech Support</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Expert help anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <h5 className="font-bold text-slate-900 mb-3.5 text-xs">About</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/our-story" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Our Story</Link></li>
              <li><Link to="/careers" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-3.5 text-xs">Shop</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/shop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Best Sellers</Link></li>
              <li><Link to="/shop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Refurbished</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-3.5 text-xs">Support</h5>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-returns" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/faq" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-slate-900 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div className="col-span-2">
            <h5 className="font-bold text-slate-900 mb-2 text-xs">Newsletter</h5>
            <p className="text-[11px] text-slate-400 mb-3">Get the latest tech updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center max-w-sm">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 px-3.5 py-2.5 rounded-l-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="px-4 py-2.5 rounded-r-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2024 Ecart. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
