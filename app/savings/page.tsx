'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

// ─── Mock / fallback data ───────────────────────────────────────────────────
const MOCK = {
  total: 1620,
  today: 120,
  thisMonth: 1620,
  thisYear: 7112,
  categories: [
    { name: 'อาหาร',      value: 450, percent: 28, color: '#FFA15B' },
    { name: 'เครื่องดื่ม', value: 280, percent: 17, color: '#34D1BF' },
    { name: 'ช้อปปิ้ง',   value: 680, percent: 42, color: '#6610F2' },
  ],
  activity: [
    { id: '1', title: 'โปร 3 แมม 1',  store: "Swensen's – Central Plaza ลำปาง", savings: 978, when: 'วันนี้',   emoji: '🍨' },
    { id: '2', title: 'โปร 1 แมม 1',  store: 'กุ้มส์ (บ้านสลัด)',               savings: 25,  when: 'เมื่อวาน', emoji: '🥗' },
  ],
}

// ─── Custom SVG Donut ───────────────────────────────────────────────────────
function DonutChart({ categories }: { categories: typeof MOCK.categories }) {
  const r = 62
  const sw = 26
  const size = (r + sw) * 2 + 4
  const cx = size / 2
  const cy = size / 2
  const c = 2 * Math.PI * r
  const total = categories.reduce((s, d) => s + d.value, 0)
  let acc = 0

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {categories.map((seg) => {
        const len = (seg.value / total) * c
        const el = (
          <circle
            key={seg.name}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw}
            strokeDasharray={`${len} ${c}`}
            strokeDashoffset={-acc}
          />
        )
        acc += len
        return el
      })}
    </svg>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function SavingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [savings, setSavings] = useState({
    total: 0, today: 0, thisMonth: 0, thisYear: 0,
    recentRedemptions: [] as Array<{ id: string; title: string; storeName: string; savings: number; date: Date }>,
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))

    fetch('/api/user/savings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSavings({
            total: data.data.totalSavings ?? 0,
            today: data.data.todaySavings ?? 0,
            thisMonth: data.data.monthlySavings?.[0]?.savings ?? 0,
            thisYear: data.data.totalSavings ?? 0,
            recentRedemptions: (data.data.recentRedemptions ?? []).map((r: any) => ({ ...r, date: new Date(r.date) })),
          })
          setApiLoaded(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Use API data if loaded, else mock
  const total      = apiLoaded ? savings.total     : MOCK.total
  const today      = apiLoaded ? savings.today     : MOCK.today
  const thisMonth  = apiLoaded ? savings.thisMonth : MOCK.thisMonth
  const thisYear   = apiLoaded ? savings.thisYear  : MOCK.thisYear
  const catTotal   = MOCK.categories.reduce((s, c) => s + c.value, 0)

  const activity = (apiLoaded && savings.recentRedemptions.length > 0)
    ? savings.recentRedemptions.slice(0, 5).map(r => ({
        id: r.id, title: r.title, store: r.storeName,
        savings: r.savings, when: r.date.toLocaleDateString('th-TH'), emoji: '🏷️',
      }))
    : MOCK.activity

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* ── Blue header ───────────────────────────────── */}
      <div className="pt-16" style={{ background: 'linear-gradient(160deg, #2563EB 0%, #3B82F6 100%)' }}>
        <div className="px-5 pt-6 pb-28">
          <h1 className="text-2xl font-bold text-white mb-1">การประหยัดของคุณ</h1>
        </div>
      </div>

      {/* ── Summary card (overlaps header) ────────────── */}
      <div className="px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-1">ประหยัดทั้งหมด</p>
          <p className="text-4xl font-bold text-gray-900 mb-5">{total.toLocaleString()} ฿</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* วันนี้ */}
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#FFF7ED' }}>
              <p className="text-xs text-orange-400 font-medium mb-1">วันนี้</p>
              <p className="text-xl font-bold text-gray-800">{today.toLocaleString()}฿</p>
            </div>
            {/* เดือนนี้ */}
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#ECFDF5' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#34D196' }}>เดือนนี้</p>
              <p className="text-xl font-bold" style={{ color: '#059669' }}>{thisMonth.toLocaleString()}฿</p>
            </div>
          </div>

          {/* ปีนี้ */}
          <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: '#EFF6FF' }}>
            <p className="text-xs text-blue-400 font-medium mb-1">ปีนี้</p>
            <p className="text-xl font-bold text-blue-700">{thisYear.toLocaleString()}฿</p>
          </div>
        </div>
      </div>

      {/* ── Donut chart card ───────────────────────────── */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-5">การประหยัดแยกตามหมวด</h2>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative flex-shrink-0">
              <DonutChart categories={MOCK.categories} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{catTotal.toLocaleString()}฿</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-4 flex-1">
              {MOCK.categories.map(cat => (
                <div key={cat.name} className="flex items-start gap-3">
                  <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{cat.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{cat.value.toLocaleString()}฿</p>
                    <p className="text-xs text-gray-400">{cat.percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent activity card ───────────────────────── */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">กิจกรรมล่าสุด</h2>
            <button
              onClick={() => router.push('/savings/activity')}
              className="text-xs text-blue-600 flex items-center gap-1"
            >
              ดูทั้งหมด
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>

          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 truncate">{item.store}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">{item.savings.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{item.when}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
    </div>
  )
}
