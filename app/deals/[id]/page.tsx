'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import QRCode from 'qrcode'
import { Deal } from '@/components/DealCard'
import Navigation from '@/components/Navigation'

type View = 'detail' | 'qr' | 'success'

export default function DealDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [view, setView] = useState<View>('detail')
  const [deal, setDeal] = useState<Deal | null>(null)
  const [qrCode, setQrCode] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [qrSeconds, setQrSeconds] = useState(300)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${params.id}`)
        const data = await response.json()
        if (data.success && data.deal) {
          setDeal(data.deal)
          setIsFavorite(favorites.includes(data.deal.id))
          generateQRCode(data.deal.id)
        } else {
          router.push('/deals')
        }
      } catch {
        router.push('/deals')
      }
    }
    fetchDeal()
  }, [params.id])

  useEffect(() => {
    if (view === 'qr') {
      setQrSeconds(300)
      timerRef.current = setInterval(() => {
        setQrSeconds(s => (s <= 1 ? 0 : s - 1))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [view])

  useEffect(() => {
    if (view === 'qr' && qrSeconds === 0) {
      router.push('/deals')
    }
  }, [qrSeconds, view])

  const generateQRCode = async (dealId?: string) => {
    try {
      const qrData = `RICHSAVE:${dealId ?? params.id}:${Date.now()}`
      const url = await QRCode.toDataURL(qrData, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      setQrCode(url)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
    }
  }

  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== deal?.id)
      : [...favorites, deal?.id]
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  const handleRedeem = () => {
    if (!user) { router.push('/login'); return }
    setView('qr')
  }

  const [copied, setCopied] = useState(false)
  const handleShare = async () => {
    const url = window.location.href
    const title = deal ? `${deal.storeName} - ลด ${deal.discount}` : 'RichSave Deal'
    const text = deal ? `${deal.title} ในราคาเพียง ฿${deal.discountedPrice}` : ''
    if (navigator.share) {
      try { await navigator.share({ title, text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatQrTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  const savings = deal.originalPrice - deal.discountedPrice
  const distance = deal.location?.address ? '1.4 กม.' : '-'

  // ===== QR VIEW =====
  if (view === 'qr') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation isAuthenticated={!!user} userName={user?.name} />

        <div className="pt-20 pb-40 md:pb-8 px-4 md:px-6 max-w-5xl mx-auto">
          {/* Timer bar */}
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 text-sm font-medium">เหลือเวลา</span>
            </div>
            <span className="text-red-600 text-2xl font-bold tabular-nums">{formatQrTime(qrSeconds)}</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b mb-6">
            <h1 className="text-lg font-bold text-gray-900">ใช้ดีล</h1>
            <button onClick={() => setView('detail')} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2-column on desktop */}
          <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">

            {/* LEFT: QR Code */}
            <div className="md:sticky md:top-24">
              <p className="text-center font-semibold text-gray-800 mb-4">QR Code</p>
              {qrCode && (
                <div className="border-2 border-blue-600 rounded-2xl p-4 max-w-xs mx-auto mb-3">
                  <img src={qrCode} alt="QR Code" className="w-full h-auto" />
                </div>
              )}
              <p className="text-center text-sm text-gray-500 mb-6">
                แสดง QR Code นี้ให้พนักงานสแกนเพื่อรับส่วนลด
              </p>
            </div>

            {/* RIGHT: Details + warnings + buttons */}
            <div className="space-y-4">
              {/* Details table */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="font-semibold text-gray-800 mb-3">รายละเอียด</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ร้านค้า</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%]">{deal.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ดีล</span>
                    <span className="font-medium text-gray-800 text-right max-w-[60%]">{deal.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ส่วนลด</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">{deal.discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ราคา</span>
                    <span className="font-medium text-gray-800">฿{deal.discountedPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ระยะทาง</span>
                    <span className="font-medium text-gray-800">{distance}</span>
                  </div>
                </div>
              </div>

              {/* How to use */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="font-semibold text-gray-800 mb-3">วิธีใช้ดีล</p>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="text-blue-600 font-bold">1.</span> แสดง QR Code นี้ให้พนักงานสแกน</li>
                  <li className="flex gap-2"><span className="text-blue-600 font-bold">2.</span> แสดงตัวตนกับพนักงานเพื่อยืนยันตัวตน</li>
                  <li className="flex gap-2"><span className="text-blue-600 font-bold">3.</span> รอให้พนักงานยืนยันการใช้ดีล</li>
                  <li className="flex gap-2"><span className="text-blue-600 font-bold">4.</span> เพลิดเพลินกับส่วนลดของคุณ!</li>
                </ol>
              </div>

              {/* Warning */}
              <div className="bg-red-50 rounded-2xl p-4">
                <p className="font-semibold text-red-700 mb-2">คำเตือน</p>
                <ul className="space-y-1 text-sm text-red-600">
                  <li>• ห้ามถ่ายภาพหน้าจอ QR Code</li>
                  <li>• ใช้ได้เพียง 1 ครั้งเท่านั้น</li>
                  <li>• ไม่สามารถยกเลิกหลังจากใช้ดีลได้</li>
                </ul>
              </div>

              {/* Buttons — desktop only (inline), mobile uses fixed bar below */}
              <div className="hidden md:block space-y-2">
                <button
                  onClick={() => setView('success')}
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-2xl text-base"
                >
                  ยืนยันการใช้ดีล
                </button>
                <button
                  onClick={() => setView('detail')}
                  className="w-full py-2 text-gray-500 font-medium text-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile fixed bottom buttons */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-4 space-y-2 z-40">
          <button
            onClick={() => setView('success')}
            className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-2xl text-base"
          >
            ยืนยันการใช้ดีล
          </button>
          <button
            onClick={() => setView('detail')}
            className="w-full py-2 text-gray-500 font-medium text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    )
  }

  // ===== SUCCESS VIEW =====
  if (view === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation isAuthenticated={!!user} userName={user?.name} />
        <div className="pt-32 pb-24 px-4">
          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Green checkmark */}
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-5">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">ใช้ดีลสำเร็จ!</h1>
            <p className="text-gray-500 mb-8">คุณได้รับส่วนลดแล้ว</p>

            {/* Savings card */}
            <div className="w-full border border-green-200 rounded-2xl p-5 mb-6 bg-white">
              <p className="text-center text-gray-600 mb-1">คุณประหยัดได้</p>
              <p className="text-center text-4xl font-bold text-green-600 mb-1">฿{savings}</p>
              <p className="text-center text-gray-500 text-sm mb-4">จากการใช้ดีลนี้</p>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ร้านค้า</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{deal.storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ดีล</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{deal.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ส่วนลด</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">{deal.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ราคา</span>
                  <span className="font-medium text-gray-800">฿{deal.discountedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ระยะทาง</span>
                  <span className="font-medium text-gray-800">{distance}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                <span>🎁</span>
                <span>ส่งผลประโยชน์ไปยังกล่องข้อความของคุณแล้ว</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/deals')}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-2xl text-base"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== DETAIL VIEW =====
  return (
    <div className="min-h-screen bg-gray-50 pb-40 md:pb-8">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      <div className="pt-16">
        <div className="md:max-w-6xl md:mx-auto md:px-6 md:py-8">
          <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">

            {/* LEFT: Hero Image */}
            <div className="relative h-72 md:h-[520px] overflow-hidden md:rounded-2xl md:sticky md:top-24">
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = `https://via.placeholder.com/800x400?text=${encodeURIComponent(deal.storeName)}` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Back */}
              <button
                onClick={() => router.back()}
                className="absolute top-10 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              {/* Favorite */}
              <button
                onClick={handleToggleFavorite}
                className="absolute top-10 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow"
              >
                <svg
                  className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Discount badge */}
              <div className="absolute bottom-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                ลด {deal.discount}
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className="md:space-y-4">
              {/* Main content card */}
              <div className="bg-white px-4 pt-4 pb-5 md:rounded-2xl md:shadow-sm">
                {/* Distance */}
                {deal.location && (
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{distance}</span>
                  </div>
                )}

                {/* Store + Deal title */}
                <h1 className="text-xl font-bold text-gray-900">{deal.storeName}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{deal.title}</p>
                <span className="inline-block mt-1 text-xs text-gray-400">{deal.category}</span>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-3xl font-bold text-blue-600">฿{deal.discountedPrice}</span>
                  <span className="text-gray-400 line-through text-lg">฿{deal.originalPrice}</span>
                </div>

                {/* Info cards */}
                <div className="flex gap-3 mt-4">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-gray-400">หมดอายุ</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{formatExpiry(deal.expiresAt)}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-gray-400">ระยะทาง</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{distance}</p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              {deal.terms && deal.terms.length > 0 && (
                <div className="bg-blue-50 mx-4 md:mx-0 mt-3 md:mt-0 rounded-2xl p-4">
                  <p className="font-semibold text-gray-800 mb-2">เงื่อนไขการใช้</p>
                  <ul className="space-y-1.5">
                    {deal.terms.map((term, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className="bg-white mx-4 md:mx-0 mt-3 md:mt-0 rounded-2xl p-4">
                <p className="font-semibold text-gray-800 mb-2">รายละเอียด</p>
                <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden md:flex gap-3 pt-2">
                <button onClick={handleShare} className="flex-1 py-3 border-2 border-blue-600 rounded-2xl text-blue-600 font-semibold flex items-center justify-center gap-2 text-sm">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14.5" cy="4.5" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="10" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="14.5" cy="15.5" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.25 11.05L12.75 14.45" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.75 5.55L7.25 8.95" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {copied ? 'คัดลอกแล้ว!' : 'แชร์'}
                </button>
                <button
                  onClick={handleRedeem}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  ใช้ดีล
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t px-4 py-4 flex gap-3 z-40">
        <button onClick={handleShare} className="flex-1 py-3 border-2 border-blue-600 rounded-2xl text-blue-600 font-semibold flex items-center justify-center gap-2 text-sm">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14.5" cy="4.5" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="5.5" cy="10" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="14.5" cy="15.5" r="2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.25 11.05L12.75 14.45" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.75 5.55L7.25 8.95" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {copied ? 'คัดลอกแล้ว!' : 'แชร์'}
        </button>
        <button
          onClick={handleRedeem}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 text-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          ใช้ดีล
        </button>
      </div>
    </div>
  )
}
