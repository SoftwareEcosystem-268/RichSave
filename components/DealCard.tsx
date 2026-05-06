'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface Deal {
  id: string
  title: string
  description: string
  discount: string
  originalPrice: number
  discountedPrice: number
  storeName: string
  storeLogo?: string
  image: string
  category: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  expiresAt?: string
  terms?: string[]
  isFavorite?: boolean
}

interface DealCardProps {
  deal: Deal
  onToggleFavorite?: (dealId: string) => void
}

export default function DealCard({ deal, onToggleFavorite }: DealCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(deal.id)
  }

  const savings = deal.originalPrice - deal.discountedPrice

  return (
    <div
      onClick={() => router.push(`/deals/${deal.id}`)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm"
    >
      {/* Image Section */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {!imageError ? (
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🏷️</span>
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          ลด {deal.discount}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow"
        >
          <svg
            className={`w-5 h-5 transition-colors ${deal.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
            fill={deal.isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-1">{deal.title}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{deal.storeName}</p>

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">฿{deal.discountedPrice.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">฿{deal.originalPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
