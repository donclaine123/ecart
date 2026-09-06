import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Product Image Box */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/3] bg-slate-50 overflow-hidden block">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Rating Pill Overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-slate-800 shadow-sm flex items-center gap-1 border border-slate-100/80">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>{product.rating}</span>
          <span className="text-slate-400 font-normal">({product.reviews_count})</span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">
            {product.category_name}
          </span>
          <Link to={`/product/${product.slug}`} className="hover:text-indigo-600 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-base font-extrabold text-slate-900">
            ${parseFloat(product.price).toFixed(0)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
              added ? 'text-emerald-600' : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              'Add to Cart +'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
