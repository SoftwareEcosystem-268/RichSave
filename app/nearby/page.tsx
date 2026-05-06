'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import { Deal } from '@/components/DealCard'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  ),
})

const DISCOUNTS = ['10%', '15%', '20%', '25%', '30%', '35%', '40%', '50%']
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
]
const DRINK_IMAGES = [
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
]
const SHOP_IMAGES = [
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=300&fit=crop',
]
const ENT_IMAGES = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
]

function getCategory(amenity: string, shop: string): string {
  if (['cafe', 'bar', 'bubble_tea'].includes(amenity) || ['coffee', 'tea', 'beverages'].includes(shop)) return 'Drinks'
  if (['cinema', 'theatre', 'nightclub'].includes(amenity)) return 'Entertainment'
  if (shop && ['clothing', 'supermarket', 'convenience', 'mall', 'department_store', 'shoes', 'fashion'].includes(shop)) return 'Shopping'
  return 'Food'
}

function getImage(category: string, idx: number): string {
  if (category === 'Drinks') return DRINK_IMAGES[idx % DRINK_IMAGES.length]
  if (category === 'Shopping') return SHOP_IMAGES[idx % SHOP_IMAGES.length]
  if (category === 'Entertainment') return ENT_IMAGES[idx % ENT_IMAGES.length]
  return FOOD_IMAGES[idx % FOOD_IMAGES.length]
}

function makeDiscount(category: string, idx: number) {
  const pct = DISCOUNTS[idx % DISCOUNTS.length]
  const p = parseInt(pct)
  const bases: Record<string, number[]> = {
    Food: [80, 120, 150, 200, 250, 300],
    Drinks: [50, 65, 80, 95, 120],
    Shopping: [200, 350, 500, 700, 990],
    Entertainment: [120, 150, 200, 250],
  }
  const baseArr = bases[category] || bases.Food
  const original = baseArr[idx % baseArr.length]
  const discounted = Math.round(original * (1 - p / 100))
  return { discount: pct, originalPrice: original, discountedPrice: discounted }
}

async function fetchNearbyPlaces(lat: number, lng: number, signal?: AbortSignal): Promise<Deal[]> {
  const query = `[out:json][timeout:15];(node["amenity"~"restaurant|cafe|fast_food|bar|food_court|cinema"](around:2500,${lat},${lng});node["shop"~"clothing|supermarket|convenience|bakery|coffee|fashion|shoes"](around:2500,${lat},${lng}););out body;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
    signal,
  })
  const data = await res.json()
  return (data.elements as any[])
    .filter((el) => el.tags?.name)
    .slice(0, 25)
    .map((el, i) => {
      const amenity = el.tags.amenity || ''
      const shop = el.tags.shop || ''
      const category = getCategory(amenity, shop)
      const { discount, originalPrice, discountedPrice } = makeDiscount(category, i)
      return {
        id: `osm-${el.id}`,
        title: `${el.tags.name} โปรพิเศษ`,
        description: el.tags.cuisine ? `อาหาร ${el.tags.cuisine}` : `โปรโมชันพิเศษจากร้าน ${el.tags.name}`,
        discount,
        originalPrice,
        discountedPrice,
        storeName: el.tags.name,
        category,
        image: getImage(category, i),
        location: {
          lat: el.lat,
          lng: el.lon,
          address: el.tags['addr:street'] || el.tags['addr:full'] || el.tags.name,
        },
        expiresAt: new Date(Date.now() + ((7 + i * 3) % 30 + 1) * 86400000).toISOString(),
        terms: ['ใช้ได้ 1 ครั้งต่อคน', 'ไม่สามารถใช้ร่วมกับโปรโมชันอื่น'],
      } as Deal
    })
}

export default function NearbyPage() {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const handleDealClick = useCallback((deal: Deal) => {
    setSelectedDeal(deal)
  }, [])
  const [deals, setDeals] = useState<Deal[]>([])
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [searchText, setSearchText] = useState('')
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | undefined>()
  const [searching, setSearching] = useState(false)
  const [loadingPlaces, setLoadingPlaces] = useState(false)

  const defaultCenter = { lat: 18.2866, lng: 99.4951 }

  const getMockDealsWithLocation = (centerLat: number, centerLng: number): Deal[] => [
    { id: 'mock-1', title: 'ซูปเปอร์แซ่บ โปรพิเศษ', description: 'ตำปูปลาร้า + คอหมูย่าง', discount: '35%', originalPrice: 115, discountedPrice: 74, storeName: 'ซูปเปอร์แซ่บ', category: 'Food', image: FOOD_IMAGES[0], location: { lat: centerLat + 0.003, lng: centerLng - 0.002, address: 'ใกล้มธ.ลำปาง' }, expiresAt: new Date(Date.now() + 7*86400000).toISOString(), terms: ['ใช้ได้ 1 ครั้งต่อคน'] },
    { id: 'mock-2', title: 'Pizza Hut ส่วนลดพิเศษ', description: 'พิซซ่าซื้อ 1 แถม 1', discount: '40%', originalPrice: 350, discountedPrice: 210, storeName: 'Pizza Hut', category: 'Food', image: FOOD_IMAGES[1], location: { lat: centerLat - 0.004, lng: centerLng + 0.005, address: 'Central ลำปาง' }, expiresAt: new Date(Date.now() + 2*86400000).toISOString(), terms: ['ใช้ได้ที่สาขาร่วมรายการ'] },
    { id: 'mock-3', title: 'Amazon Coffee กาแฟลด 20%', description: 'กาแฟและเครื่องดื่มทุกแก้ว', discount: '20%', originalPrice: 80, discountedPrice: 64, storeName: 'Amazon Coffee', category: 'Drinks', image: DRINK_IMAGES[0], location: { lat: centerLat + 0.001, lng: centerLng + 0.003, address: 'ใกล้มธ.ลำปาง' }, expiresAt: new Date(Date.now() + 14*86400000).toISOString(), terms: ['ใช้ได้ 1 ครั้งต่อวัน'] },
    { id: 'mock-4', title: "Swensen's Ice Cream", description: 'ซื้อ 1 แถม 1 ไอศกรีม', discount: '50%', originalPrice: 120, discountedPrice: 60, storeName: "Swensen's", category: 'Food', image: FOOD_IMAGES[2], location: { lat: centerLat - 0.002, lng: centerLng - 0.004, address: 'Central ลำปาง' }, expiresAt: new Date(Date.now() + 5*86400000).toISOString(), terms: ['ใช้ได้เฉพาะวันธรรมดา'] },
    { id: 'mock-5', title: 'Major Cineplex ลด 30%', description: 'ตั๋วหนังทุกรอบวันธรรมดา', discount: '30%', originalPrice: 200, discountedPrice: 140, storeName: 'Major Cineplex', category: 'Entertainment', image: ENT_IMAGES[0], location: { lat: centerLat + 0.005, lng: centerLng + 0.001, address: 'Central ลำปาง' }, expiresAt: new Date(Date.now() + 10*86400000).toISOString(), terms: ['ใช้ได้เฉพาะวันจันทร์-ศุกร์'] },
    { id: 'mock-6', title: 'Starbucks Happy Hour กาแฟ', description: 'กาแฟ Frappuccino ลด 50%', discount: '50%', originalPrice: 165, discountedPrice: 83, storeName: 'Starbucks', category: 'Drinks', image: DRINK_IMAGES[1], location: { lat: centerLat - 0.005, lng: centerLng + 0.002, address: 'Central ลำปาง' }, expiresAt: new Date(Date.now() + 1*86400000).toISOString(), terms: ['ใช้ได้ 14:00-17:00 เท่านั้น'] },
    { id: 'mock-7', title: 'Uniqlo ลดทั้งร้าน', description: 'เสื้อผ้าทุกชิ้นลด 25%', discount: '25%', originalPrice: 590, discountedPrice: 443, storeName: 'Uniqlo', category: 'Shopping', image: SHOP_IMAGES[0], location: { lat: centerLat + 0.002, lng: centerLng - 0.005, address: 'Central ลำปาง' }, expiresAt: new Date(Date.now() + 3*86400000).toISOString(), terms: ['เฉพาะสุดสัปดาห์'] },
    { id: 'mock-8', title: 'บ้านสลัด สดใหม่', description: 'สลัดผักออร์แกนิคราคาพิเศษ', discount: '15%', originalPrice: 89, discountedPrice: 76, storeName: 'บ้านสลัด', category: 'Food', image: FOOD_IMAGES[0], location: { lat: centerLat - 0.001, lng: centerLng - 0.003, address: 'ถ.พหลโยธิน ลำปาง' }, expiresAt: new Date(Date.now() + 30*86400000).toISOString(), terms: ['ใช้ได้ทุกวัน'] },
  ]

  const loadPlaces = async (lat: number, lng: number) => {
    setLoadingPlaces(true)
    // Always load mock deals immediately so pins show up
    setDeals(getMockDealsWithLocation(lat, lng))
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const places = await fetchNearbyPlaces(lat, lng, controller.signal)
      clearTimeout(timeout)
      if (places.length >= 3) {
        setDeals(places)
      }
      // else keep the mock deals already set
    } catch {
      // keep mock deals already set
    } finally {
      setLoadingPlaces(false)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          loadPlaces(loc.lat, loc.lng)
        },
        () => {
          setUserLocation(defaultCenter)
          loadPlaces(defaultCenter.lat, defaultCenter.lng)
        }
      )
    } else {
      setUserLocation(defaultCenter)
      loadPlaces(defaultCenter.lat, defaultCenter.lng)
    }
  }, [])

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchText.trim()
    if (!q) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'th,en' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const newLat = parseFloat(data[0].lat)
        const newLng = parseFloat(data[0].lon)
        setFlyTo({ lat: newLat, lng: newLng, zoom: 15 })
        loadPlaces(newLat, newLng)
      }
    } catch {}
    setSearching(false)
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ top: 64, bottom: 64 }}>
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Location search bar overlay */}
      <form
        onSubmit={handleLocationSearch}
        className="absolute top-4 left-4 right-4 z-[1000]"
      >
        <div className="bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="ค้นหาสถานที่บนแผนที่..."
            className="flex-1 text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
          />
          {searching || loadingPlaces ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button type="submit" className="text-blue-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>
        {loadingPlaces && (
          <p className="text-xs text-center text-blue-600 mt-2 bg-white/80 rounded-xl py-1">กำลังโหลดร้านค้าจริงในพื้นที่...</p>
        )}
      </form>

      {/* Map */}
      <div className="flex-1 relative">
        {userLocation ? (
          <MapView
            userLocation={userLocation}
            deals={deals}
            onDealClick={handleDealClick}
            flyTo={flyTo}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Selected deal card */}
      {selectedDeal && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
            <button
              onClick={() => setSelectedDeal(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
            <img
              src={selectedDeal.image || '/placeholder.jpg'}
              alt={selectedDeal.title}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{selectedDeal.storeName}</p>
              <p className="text-gray-500 text-xs truncate">{selectedDeal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-600 font-bold text-sm">฿{selectedDeal.discountedPrice}</span>
                <span className="text-gray-400 line-through text-xs">฿{selectedDeal.originalPrice}</span>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">ลด {selectedDeal.discount}</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/deals/${selectedDeal.id}`)}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0"
            >
              ดูดีล
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

