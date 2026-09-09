import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Tag } from 'lucide-react'
import api from '../api/axios'
import { mockCategories, mockProducts } from '../data/mockProducts'
import ProductCard from '../components/common/ProductCard'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'all'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')

  const [categories, setCategories] = useState(mockCategories)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  // 1. Fetch Categories
  useEffect(() => {
    let isMounted = true
    async function loadCategories() {
      try {
        const res = await api.get('/categories')
        if (isMounted && res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data)
        }
      } catch (err) {
        console.warn('Could not load categories from backend, using fallback:', err.message)
      }
    }
    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  // 2. Fetch Products based on filters
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (categoryParam !== 'all') {
        params.category = categoryParam
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      if (sortBy) {
        params.sort = sortBy
      }

      const res = await api.get('/products', { params })
      const productList = res.data?.data || res.data || []

      if (Array.isArray(productList) && productList.length > 0) {
        setProducts(productList)
        setUsingFallback(false)
      } else if (res.data?.data && res.data.data.length === 0) {
        // Zero results from server search/filter
        setProducts([])
        setUsingFallback(false)
      } else {
        throw new Error('Invalid product payload')
      }
    } catch (err) {
      console.warn('Backend unavailable, falling back to local dataset:', err.message)
      setUsingFallback(true)
    } finally {
      setLoading(false)
    }
  }, [categoryParam, searchQuery, sortBy])

  // Debounce search/filter query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts()
    }, 250)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  // Client-side fallback filter if usingFallback is true
  const fallbackFilteredProducts = useMemo(() => {
    if (!usingFallback) return products

    return mockProducts
      .filter((product) => {
        if (categoryParam !== 'all' && product.category_slug !== categoryParam) {
          return false
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          return (
            product.name.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q) ||
            product.sku.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating)
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
      })
  }, [usingFallback, products, categoryParam, searchQuery, sortBy])

  const displayedProducts = usingFallback ? fallbackFilteredProducts : products

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
        </button>

        {categories.map((cat) => (
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
            {cat.products_count !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-60">({cat.products_count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Products Grid or Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
