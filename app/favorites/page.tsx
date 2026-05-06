'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Deal } from '@/components/DealCard'

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // within 3 days
}

interface FavoriteCardProps {
  deal: Deal
  onToggleFavorite: (id: string) => void
  onClick: () => void
}

function FavoriteCard({ deal, onToggleFavorite, onClick }: FavoriteCardProps) {
  const [imageError, setImageError] = useState(false)
  const expiring = isExpiringSoon(deal.expiresAt)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
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

        {/* Discount badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          ลด {deal.discount}
        </div>

        {/* Expiring badge */}
        {expiring && (
          <div className="absolute top-3 right-14 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ใกล้หมดอายุ
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(deal.id) }}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow"
        >
          <svg className="w-5 h-5 text-red-500 fill-red-500" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-gray-900 text-base mb-0.5 line-clamp-1">{deal.title}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{deal.description || deal.storeName}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">฿{deal.discountedPrice.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through">฿{deal.originalPrice.toLocaleString()}</span>
          </div>
          {deal.location?.address && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="line-clamp-1 max-w-[120px]">{deal.location.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [favoriteDeals, setFavoriteDeals] = useState<Deal[]>([])
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchFavoritesAndDeals()
  }, [router])

  const fetchFavoritesAndDeals = async () => {
    try {
      const favResponse = await fetch('/api/user/favorites')
      const favData = await favResponse.json()
      const favoriteIds = favData.success && favData.favorites ? favData.favorites : []

      const dealsResponse = await fetch('/api/deals')
      const dealsData = await dealsResponse.json()
      const allDeals = Array.isArray(dealsData) ? dealsData : (dealsData.deals ?? [])

      const favDeals = allDeals.filter((deal: Deal) => favoriteIds.includes(deal.id))
      setFavoriteDeals(favDeals)
      setFavorites(new Set(favoriteIds))
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (dealId: string) => {
    const newFavorites = new Set(favorites)
    const isAdding = !newFavorites.has(dealId)

    if (isAdding) {
      newFavorites.add(dealId)
    } else {
      newFavorites.delete(dealId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]))

    try {
      await fetch('/api/user/favorites', {
        method: isAdding ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      })
    } catch (error) {
      console.error('Failed to update favorites:', error)
    }

    setFavoriteDeals(prev => prev.filter(deal => newFavorites.has(deal.id)))
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Header */}
      <div className="pt-20 px-6 pb-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">รายการโปรด</h1>
          {favoriteDeals.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">{favoriteDeals.length} ดีลที่บันทึกไว้</p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-4">
        {favoriteDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoriteDeals.map(deal => (
              <FavoriteCard
                key={deal.id}
                deal={deal}
                onToggleFavorite={handleToggleFavorite}
                onClick={() => router.push(`/deals/${deal.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-gray-400 text-base font-medium mb-1">ยังไม่มีรายการโปรด</p>
            <p className="text-gray-300 text-sm mb-6">กดหัวใจบนดีลที่ชอบเพื่อบันทึกไว้ที่นี่</p>
            <button
              onClick={() => router.push('/deals')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium"
            >
              ค้นหาดีล
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


