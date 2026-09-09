import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Smartphone, Laptop, Headphones, Watch } from 'lucide-react'
import api from '../api/axios'
import { mockProducts } from '../data/mockProducts'
import ProductCard from '../components/common/ProductCard'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const defaultCategories = [
    { name: 'Flagship Phones', slug: 'smartphones', icon: Smartphone },
    { name: 'Pro Laptops', slug: 'laptops', icon: Laptop },
    { name: 'Noise Cancelling', slug: 'audio', icon: Headphones },
    { name: 'Smart Accessories', slug: 'wearables', icon: Watch },
  ]

  useEffect(() => {
    let isMounted = true

    async function loadFeatured() {
      try {
        const res = await api.get('/featured-products')
        if (isMounted) {
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setFeaturedProducts(res.data.data.slice(0, 4))
          } else {
            // Fallback if empty database
            setFeaturedProducts(mockProducts.filter((p) => p.is_featured).slice(0, 4))
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback products:', err.message)
        if (isMounted) {
          setFeaturedProducts(mockProducts.filter((p) => p.is_featured).slice(0, 4))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFeatured()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-20 pt-10 sm:pt-14">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Next-Gen Tech,<br />
              <span className="text-slate-800">Simplified.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed">
              Discover premium electronics designed for seamless daily performance, engineered for elegance, built for power.
            </p>

            <div className="flex items-center gap-3.5 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Shop Latest Devices
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                View Deals
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-slate-100/70 border border-slate-200/50 aspect-[4/3] flex items-center justify-center group shadow-sm">
              <img
                src="/hero-devices.jpg"
                alt="Flagship Series Showcase"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-6 right-6 text-right select-none pointer-events-none">
                <span className="text-xs uppercase tracking-widest text-slate-600 font-extrabold block">
                  FLAGSHIP SERIES
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mt-0.5">
                  ULTIMATE FREEDOM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Explore Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {defaultCategories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <Link
                key={i}
                to={`/shop?category=${cat.slug}`}
                className="bg-slate-50 hover:bg-slate-100/90 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 border border-slate-100 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:text-indigo-600 group-hover:scale-105 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 text-center">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Curated Selection / Trending Devices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
              CURATED SELECTION
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Trending Devices
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse shadow-sm"
              >
                <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
