import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)

    const res = await addToCart(product, 1)
    if (res?.requireAuth) {
      navigate('/login')
      return
    }
    if (res?.success === false) {
      setAdded(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Product Image Box */}
      <Link to={`/product/${product.slug}`} state={{ product }} className="relative aspect-[4/3] bg-slate-50 overflow-hidden block">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        {/* Rating Pill Overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-slate-800 shadow-sm flex items-center gap-1 border border-slate-100/80">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{product.rating || '4.9'}</span>
          <span className="text-slate-400 font-normal">({product.reviews_count || '128'})</span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {product.category?.name || product.category_name || 'Electronics'}
          </span>
          <Link to={`/product/${product.slug}`} state={{ product }} className="hover:text-indigo-600 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-slate-900">
            ${parseFloat(product.price || 0).toFixed(0)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigate('/checkout', {
                  state: {
                    directItem: { product, quantity: 1 },
                  },
                })
              }}
              disabled={product.stock_quantity === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                added
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-slate-50/50'
              }`}
              title="Add to Cart"
            >
              {added ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : '+'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
