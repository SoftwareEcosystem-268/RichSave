'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import DealCard, { Deal } from '@/components/DealCard'

const categories = [
  { id: 'Food', label: 'อาหาร', icon: '/alpha/food.svg' },
  { id: 'Drinks', label: 'เครื่องดื่ม', icon: '/alpha/drink.svg' },
  { id: 'Shopping', label: 'ช้อปปิ้ง', icon: '/alpha/shopping.svg' },
  { id: 'Entertainment', label: 'บันเทิง', icon: '/alpha/joyful.svg' },
]

export default function DealsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deals, setDeals] = useState<Deal[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals')
        const data = await response.json()
        if (data.success) {
          setDeals(data.deals)
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Check authentication and load favorites
  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('user')

      if (userData) {
        setUser(JSON.parse(userData))

        // Fetch user favorites from API
        try {
          const response = await fetch('/api/user/favorites')
          const data = await response.json()
          if (data.success && data.favorites) {
            setFavorites(new Set(data.favorites))
          }
        } catch (error) {
          console.error('Failed to fetch favorites:', error)
        }
      }

      // Load favorites from localStorage as fallback
      const savedFavorites = localStorage.getItem('favorites')
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)))
      }
    }

    checkAuth()
  }, [])

  const filteredDeals = deals.filter(deal => {
    const matchesCategory = !selectedCategory || deal.category === selectedCategory
    return matchesCategory
  })

  const handleToggleFavorite = async (dealId: string) => {
    const newFavorites = new Set(favorites)
    const isAdding = !newFavorites.has(dealId)

    // Update local state
    if (isAdding) {
      newFavorites.add(dealId)
    } else {
      newFavorites.delete(dealId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]))

    // Update in database (cookies handle auth automatically)
    try {
      await fetch('/api/user/favorites', {
        method: isAdding ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId }),
      })
    } catch (error) {
      console.error('Failed to update favorites:', error)
    }

    // Update deal's favorite status in local state
    setDeals(deals.map(deal =>
      deal.id === dealId ? { ...deal, isFavorite: newFavorites.has(dealId) } : deal
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Hero / Header */}
      <div className="pt-20 pb-6 px-4 md:px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">ค้นหาดีล</h1>
          <p className="text-sm text-gray-500 mb-3">รวมดีลโปรโมชันวันนี้เดียว ช่วยให้คุณค้นหา แต่ประหยัดได้มากกว่าเดิม</p>

          {/* Location */}
          <div className="flex items-center gap-1 mb-4">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
            </svg>
            <span className="text-sm text-gray-700">Thammasat University</span>
          </div>

          {/* Search Bar — navigates to /search */}
          <div className="relative max-w-xl cursor-pointer" onClick={() => router.push('/search')}>
            <div className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-sm text-gray-400 select-none">
              ค้นหา...
            </div>
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-6">
        {/* Category Icons */}
        <div className="flex gap-3 md:gap-6 mb-6 md:mb-8 overflow-x-auto pb-2 pt-1 px-1 scrollbar-none -mx-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className="flex flex-col items-center gap-1.5 group flex-shrink-0"
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                selectedCategory === cat.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:shadow-md'
              }`}>
                <img src={cat.icon} alt={cat.label} className="w-9 h-9 md:w-12 md:h-12 object-contain" />
              </div>
              <span className={`text-xs md:text-sm font-medium ${selectedCategory === cat.id ? 'text-blue-600' : 'text-gray-700'}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Deals Near You */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ดีลใกล้คุณ
          {filteredDeals.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({filteredDeals.length} รายการ)</span>
          )}
        </h2>

        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filteredDeals.map(deal => (
              <DealCard
                key={deal.id}
                deal={{ ...deal, isFavorite: favorites.has(deal.id) }}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-base">ไม่พบดีลที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  )
}
