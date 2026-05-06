'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const MOCK_ACTIVITY = [
  { id: '1', title: 'โปร 3 แมม 1',  store: "Swensen's – Central Plaza ลำปาง", savings: 978, when: 'วันนี้',    emoji: '🍨' },
  { id: '2', title: 'โปร 1 แมม 1',  store: 'กุ้มส์ (บ้านสลัด)',               savings: 25,  when: 'เมื่อวาน',  emoji: '🥗' },
  { id: '3', title: 'ลด 40% เครื่องดื่ม', store: 'Amazon Coffee',              savings: 60,  when: '3 วันก่อน', emoji: '☕' },
  { id: '4', title: 'ลด 20% ช้อปปิ้ง',    store: 'Central Lampang',           savings: 350, when: '5 วันก่อน', emoji: '🛍️' },
  { id: '5', title: 'โปร 2 แถม 1',  store: 'Pizza Company',                   savings: 199, when: '1 อาทิตย์ก่อน', emoji: '🍕' },
]

export default function ActivityPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<Array<{
    id: string; title: string; store: string; savings: number; when: string; emoji: string
  }>>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))

    fetch('/api/user/savings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.recentRedemptions?.length > 0) {
          setActivity(data.data.recentRedemptions.map((r: any) => ({
            id: r.id,
            title: r.title,
            store: r.storeName,
            savings: r.savings,
            when: new Date(r.date).toLocaleDateString('th-TH'),
            emoji: '🏷️',
          })))
        } else {
          setActivity(MOCK_ACTIVITY)
        }
      })
      .catch(() => setActivity(MOCK_ACTIVITY))
      .finally(() => setLoading(false))
  }, [router])

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Header */}
      <div className="pt-16 bg-white border-b border-gray-100">
        <div className="px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-4">
        {activity.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm divide-y divide-gray-50">
            {activity.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 p-4 ${i === 0 ? 'rounded-t-3xl' : ''} ${i === activity.length - 1 ? 'rounded-b-3xl' : ''}`}>
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.store}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-600">+{item.savings.toLocaleString()}฿</p>
                  <p className="text-xs text-gray-400">{item.when}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">ยังไม่มีกิจกรรม</p>
          </div>
        )}
      </div>
    </div>
  )
}
