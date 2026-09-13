import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Unique SVG Monogram Mark for Ecart:
 * Seamlessly integrates the letter 'E' with an aerodynamic high-tech shopping cart,
 * featuring dual orbital nodes and an energy spark node in vivid indigo/cyan gradient.
 */
export function BrandIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }

  const iconClass = sizeMap[size] || sizeMap.md

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 ${iconClass} ${className}`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Main Ecart Gradient - Bold & Saturated for transparent/light backgrounds */}
          <linearGradient id="ecart-grad-primary" x1="6" y1="10" x2="42" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Accent Electric Cyan Gradient */}
          <linearGradient id="ecart-grad-cyan" x1="12" y1="16" x2="34" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Dynamic Cart Body / 'E' Spine & Basket Contour */}
        <path
          d="M9.5 13.5H14.5L18 28C18.25 29 19.15 29.7 20.2 29.7H33C34 29.7 34.85 29 35.1 28L37.8 17.5C38.05 16.5 37.3 15.5 36.2 15.5H17"
          stroke="url(#ecart-grad-primary)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Bar of the 'E' / Precision High-Speed Track */}
        <path
          d="M13.5 22.5H29"
          stroke="url(#ecart-grad-cyan)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Bottom Stabilizer Bar of the 'E' */}
        <path
          d="M12 34H31.5"
          stroke="url(#ecart-grad-primary)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Dual Precision Orbit Wheels */}
        <circle cx="20.5" cy="38" r="3" fill="#0284C7" />
        <circle cx="20.5" cy="38" r="1.1" fill="#FFFFFF" />

        <circle cx="31.5" cy="38" r="3" fill="#4F46E5" />
        <circle cx="31.5" cy="38" r="1.1" fill="#FFFFFF" />
      </svg>
    </div>
  )
}

/**
 * Complete BrandLogo with Typography
 */
export default function BrandLogo({
  size = 'md',
  variant = 'full',
  showTagline = false,
  tagline = 'Tech & Electronics',
  to = '/',
  isDark = false,
  className = '',
}) {
  const textSizes = {
    xs: 'text-base',
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <BrandIcon size={size} />

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight">
            <span
              className={`font-black tracking-tight ${textSizes[size] || textSizes.md} ${
                isDark ? 'text-white' : 'text-slate-900'
              } transition-colors group-hover:text-indigo-600`}
            >
              E<span className="text-indigo-600 group-hover:text-cyan-600 transition-colors">cart</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 ml-0.5 mt-1 animate-pulse" />
          </div>

          {showTagline && (
            <span
              className={`text-[9px] font-bold uppercase tracking-widest ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              } -mt-1`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-block cursor-pointer">
        {content}
      </Link>
    )
  }

  return content
}
