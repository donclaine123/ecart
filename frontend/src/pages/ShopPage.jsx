import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Tag, Loader2 } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/common/ProductCard'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_categories_db_cache')
      if (cached) {
        const list = JSON.parse(cached)
        if (Array.isArray(list) && list.length > 0) return list
      }
    } catch {}
    return []
  })

  const [allProducts, setAllProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_products_db_cache')
      if (cached) {
        const list = JSON.parse(cached)
        if (Array.isArray(list) && list.length > 0) return list
      }
    } catch {}
    return []
  })

  const [loading, setLoading] = useState(allProducts.length === 0)

  // Fetch Categories & Products in parallel directly from database
  const loadShopData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories', { timeout: 8000 }).catch(() => ({ data: null })),
        api.get('/products?per_page=100', { timeout: 8000 }).catch(() => ({ data: null })),
      ])

      const catList = catRes?.data?.data || (Array.isArray(catRes?.data) ? catRes.data : [])
      if (Array.isArray(catList) && catList.length > 0) {
        setCategories(catList)
        try {
          localStorage.setItem('ecart_categories_db_cache', JSON.stringify(catList))
        } catch {}
      }

      const prodList = prodRes?.data?.data || (Array.isArray(prodRes?.data) ? prodRes.data : [])
      if (Array.isArray(prodList) && prodList.length > 0) {
        setAllProducts(prodList)
        try {
          localStorage.setItem('ecart_products_db_cache', JSON.stringify(prodList))
        } catch {}
      }
    } catch (err) {
      console.warn('Database catalog query notice:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShopData()
  }, [loadShopData])

  // 3. Instantaneous (0ms) in-memory filtering & sorting
  const displayedProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        // Category filter
        if (categoryParam !== 'all') {
          const catSlug = (product.category?.slug || product.category_slug || '').toLowerCase()
          const catId = product.category_id || product.category?.id
          const param = String(categoryParam).toLowerCase()
          if (catSlug !== param && String(catId) !== param) {
            return false
          }
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const name = (product.name || '').toLowerCase()
          const desc = (product.description || '').toLowerCase()
          const sku = (product.sku || '').toLowerCase()
          if (!name.includes(q) && !desc.includes(q) && !sku.includes(q)) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-low' || sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price)
        if (sortBy === 'price-high' || sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price)
        if (sortBy === 'rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
      })
  }, [allProducts, categoryParam, searchQuery, sortBy])

  // Real-time item count per category
  const categoryCounts = useMemo(() => {
    const counts = {}
    for (const p of allProducts) {
      const slug = p.category?.slug || p.category_slug
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1
      }
    }
    return counts
  }, [allProducts])

  const handleCategoryChange = (slug) => {
    if (slug === 'all') {
      searchParams.delete('category')
    } else {
      searchParams.set('category', slug)
    }
    setSearchParams(searchParams)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Storefront Catalog</h1>
        <p className="mt-1 text-xs text-slate-500">
          Discover certified devices with verified server-side stock availability.
        </p>
      </div>

      {/* Controls Bar: Search & Sort */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phones, laptops, audio, wearables..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400 shadow-sm cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Customer Rating</option>
          </select>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            categoryParam === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          All Devices
          <span className="ml-1.5 text-[10px] opacity-60">({allProducts.length})</span>
        </button>

        {categories.map((cat) => {
          const count = categoryCounts[cat.slug] ?? cat.products_count
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryParam === cat.slug
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.name}
              {count !== undefined && (
                <span className="ml-1.5 text-[10px] opacity-60">({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Products Grid */}
      {loading && allProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
          <Tag className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or choosing a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              handleCategoryChange('all')
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
