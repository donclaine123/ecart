import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, ShoppingBag, Zap } from 'lucide-react'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/common/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const getInitialProduct = () => {
    // Check if passed via React Router navigation state (instant 0ms)
    if (location.state?.product && location.state.product.slug === slug) {
      return location.state.product
    }
    return null
  }

  const fallbackInitial = getInitialProduct()
  const [product, setProduct] = useState(fallbackInitial || null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(!fallbackInitial)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    const immediate = getInitialProduct()

    if (immediate) {
      setProduct(immediate)
      setLoading(false)
    } else {
      setLoading(true)
    }

    setNotFound(false)
    setQuantity(1)

    // Silent background sync for latest live stock, price, and related items
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${slug}`, { timeout: 5000 })
        if (isMounted && res.data?.product) {
          setProduct(res.data.product)
          if (res.data.related && res.data.related.length > 0) {
            setRelatedProducts(res.data.related)
          }
          setLoading(false)
          return
        }
        throw new Error('Product not found in API response')
      } catch (err) {
        if (isMounted) {
          const fallback = getInitialProduct()
          if (fallback) {
            setProduct(fallback)
            setLoading(false)
          } else {
            setNotFound(true)
            setLoading(false)
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [slug, location.state])

  const handleAddToCart = async () => {
    if (!product) return
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)

    const res = await addToCart(product, quantity)
    if (res?.requireAuth) {
      navigate('/login')
      return
    }
    if (res?.success === false) {
      setAdded(false)
    }
  }

  const handleBuyNow = () => {
    if (!product || product.stock_quantity === 0) return
    navigate('/checkout', {
      state: {
        directItem: {
          product,
          quantity,
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="aspect-square bg-slate-100 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-4 bg-slate-100 rounded w-24" />
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-6 bg-slate-100 rounded w-1/3" />
            <div className="h-24 bg-slate-100 rounded-2xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you requested does not exist or has been removed.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer">
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Media Card */}
        <div className="rounded-3xl overflow-hidden aspect-square bg-slate-50 border border-slate-100 relative shadow-sm">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.is_featured && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white shadow-sm">
              Flagship Device
            </span>
          )}
        </div>

        {/* Right: Specs & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-600 uppercase tracking-widest">
                {product.category?.name || product.category_name || 'Flagship'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">SKU: {product.sku}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <span className="text-sm font-bold text-slate-900">{product.rating || '4.9'}</span>
              <span className="text-xs text-slate-400">({product.reviews_count || '128'} owner reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${parseFloat(product.price || 0).toFixed(0)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              Free 2-Day Shipping
            </span>
          </div>

          {/* Realtime Stock Indicator */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock_quantity > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-800">
                {product.stock_quantity > 5
                  ? `In Stock (${product.stock_quantity} available)`
                  : product.stock_quantity > 0
                  ? `Only ${product.stock_quantity} units remaining in stock`
                  : 'Out of Stock'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Pessimistic lock protected</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Controls & Add to Cart */}
          {/* Quantity Controls & Purchase Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || product.stock_quantity === 0}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                disabled={quantity >= product.stock_quantity || product.stock_quantity === 0}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-98 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Buy Now
            </button>

            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`py-3.5 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer shrink-0 ${
                product.stock_quantity === 0
                  ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                  : added
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 active:scale-98'
              }`}
            >
              {product.stock_quantity === 0 ? (
                'Sold Out'
              ) : added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Guarantees */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">2-Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">Free Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-slate-100 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Similar Devices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
