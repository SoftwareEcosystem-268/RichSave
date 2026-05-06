'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import DealCard, { Deal } from '@/components/DealCard'

const POPULAR_TAGS = ['พิซซ่า', 'กาแฟ', 'ชานมไข่มุก', 'บุฟเฟต์', 'ตั๋วหนัง', 'เสื้อผ้า']
const DISCOUNT_FILTERS = ['10%+', '20%+', '30%+', '40%+', '50%+']
const RECENT_KEY = 'recentSearches'

function SearchPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [results, setResults] = useState<Deal[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searched, setSearched] = useState(!!searchParams.get('q'))

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_KEY)
    if (saved) setRecentSearches(JSON.parse(saved))
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    const savedFavs = localStorage.getItem('favorites')
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)))
  }, [])

  // Fetch all deals once
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/deals')
        const data = await res.json()
        if (data.success) setAllDeals(data.deals)
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  // Filter whenever query or discount changes
  useEffect(() => {
    if (!query && !selectedDiscount) { setResults([]); return }
    setSearched(true)

    let filtered = allDeals.filter(d =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.storeName.toLowerCase().includes(query.toLowerCase()) ||
      d.category.toLowerCase().includes(query.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(query.toLowerCase())
    )

    if (selectedDiscount) {
      const minPct = parseInt(selectedDiscount)
      filtered = filtered.filter(d => {
        const pct = parseInt(d.discount?.replace('%', '') || '0')
        return pct >= minPct
      })
    }

    setResults(filtered)
  }, [query, selectedDiscount, allDeals])

  const saveRecent = (q: string) => {
    if (!q.trim()) return
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }

  const handleSearch = (q: string) => {
    setQuery(q)
    if (q.trim()) saveRecent(q.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) saveRecent(query.trim())
  }

  const handleToggleFavorite = async (dealId: string) => {
    const newFavs = new Set(favorites)
    const isAdding = !newFavs.has(dealId)
    isAdding ? newFavs.add(dealId) : newFavs.delete(dealId)
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify([...newFavs]))
    try {
      await fetch('/api/user/favorites', {
        method: isAdding ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId }),
      })
    } catch {}
  }

  const showEmpty = !searched || (!query && !selectedDiscount)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Top Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 pt-3 pb-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ค้นหาดีล..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Discount Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {DISCOUNT_FILTERS.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDiscount(selectedDiscount === d ? '' : d)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={selectedDiscount === d
                  ? { backgroundColor: '#2563EB', color: 'white', borderColor: '#2563EB' }
                  : { backgroundColor: 'white', color: '#374151', borderColor: '#D1D5DB' }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-44 max-w-3xl mx-auto px-4">
        {showEmpty ? (
          // Empty state
          <div>
            <div className="flex flex-col items-center py-10">
              <svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_dd_54_930)">
                  <path d="M12 26C12 12.7451 22.7452 2 36 2H67.9997C81.2546 2 91.9997 12.7452 91.9997 26V57.9997C91.9997 71.2546 81.2545 81.9997 67.9997 81.9997H36C22.7451 81.9997 12 71.2545 12 57.9997V26Z" fill="url(#paint0_linear_54_930)" shapeRendering="crispEdges"/>
                  <path d="M50.3333 53.6642C57.6962 53.6642 63.665 47.6955 63.665 40.3326C63.665 32.9698 57.6962 27.001 50.3333 27.001C42.9705 27.001 37.0017 32.9698 37.0017 40.3326C37.0017 47.6955 42.9705 53.6642 50.3333 53.6642Z" stroke="white" strokeWidth="3.33291" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M66.998 56.9978L59.8323 49.832" stroke="white" strokeWidth="3.33291" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <filter id="filter0_dd_54_930" x="0" y="0" width="104" height="104" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_54_930"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="3"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_54_930"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_54_930"/>
                    <feOffset dy="10"/>
                    <feGaussianBlur stdDeviation="7.5"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="effect1_dropShadow_54_930" result="effect2_dropShadow_54_930"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_54_930" result="shape"/>
                  </filter>
                  <linearGradient id="paint0_linear_54_930" x1="12" y1="2" x2="91.9997" y2="81.9997" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/>
                    <stop offset="1" stopColor="#155DFC"/>
                  </linearGradient>
                </defs>
              </svg>
              <h2 className="text-lg font-bold text-gray-900 mt-4 mb-1">ค้นหาดีลสุดคุ้ม</h2>
              <p className="text-sm text-gray-400 text-center">ค้นพบส่วนลดและโปรโมชันที่ดีที่สุดใกล้คุณ</p>
            </div>

            {/* Popular Tags */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📈</span>
                <span className="font-semibold text-gray-800">ยอดนิยม</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:border-blue-300 transition-all"
                  >
                    <span>🔥</span>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-gray-800">ค้นหาล่าสุด</span>
                </div>
                <div className="flex flex-col gap-2">
                  {recentSearches.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSearch(r)}
                      className="flex items-center gap-3 w-full bg-white px-4 py-3 rounded-2xl border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-all text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : results.length > 0 ? (
          // Results
          <div>
            <p className="text-sm text-gray-400 mb-4">พบ {results.length} รายการ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map(deal => (
                <DealCard
                  key={deal.id}
                  deal={{ ...deal, isFavorite: favorites.has(deal.id) }}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        ) : (
          // No results
          <div className="flex flex-col items-center py-16">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-gray-400 text-sm">ไม่พบดีลที่ตรงกับ "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  )
}
