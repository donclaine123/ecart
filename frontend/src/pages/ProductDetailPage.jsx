import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, Check, ShoppingBag } from 'lucide-react'
import { mockProducts } from '../data/mockProducts'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/common/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = mockProducts.find((p) => p.slug === slug)

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you requested does not exist or has been removed.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          Return to Catalog
        </Link>
      </div>
    )
  }

  const relatedProducts = mockProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
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
              <span className="font-semibold text-slate-600 uppercase tracking-widest">{product.category_name}</span>
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
              <span className="text-sm font-bold text-slate-900">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviews_count} owner reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${parseFloat(product.price).toFixed(0)}
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
                  : `Only ${product.stock_quantity} units remaining in stock`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Pessimistic lock protected</span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Controls & Add to Cart */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                disabled={quantity >= product.stock_quantity}
                className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-1 w-full sm:w-auto py-3.5 px-6 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-98'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart (${(product.price * quantity).toFixed(0)})
                </>
              )}
            </button>
          </div>

          {/* Guarantee Pills */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              Free 2-Day Delivery
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-slate-700 mx-auto mb-1" />
              2-Year Warranty
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 text-slate-700 mx-auto mb-1" />
              30-Day Returns
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-slate-100 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Related in {product.category_name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
