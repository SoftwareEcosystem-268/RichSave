'use client'

import { useRouter } from 'next/navigation'

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'ดีลใหม่ใกล้คุณ!',
    description: 'Pizza Hut มีส่วนลด 40% ห่างจากคุณแค่ 0.8 กม.',
    time: '5 นาทีที่แล้ว',
    read: false,
  },
  {
    id: '2',
    title: 'ดีลที่บันทึกไว้กำลังจะหมดอายุ',
    description: 'โปรโมชั่น ซูปเปอร์แซ่บ แนวกินอีสาน ที่บันทึกไว้จะหมดอายุในอีก 2 วัน',
    time: '1 ชั่วโมงที่แล้ว',
    read: false,
  },
  {
    id: '3',
    title: 'คุณประหยัดได้ ฿250 เดือนนี้',
    description: 'ยอดเยี่ยม!! คุณเป็นผู้ใช้งานที่ประหยัดมากที่สุดในสัปดาห์นี้',
    time: '1 วันที่แล้ว',
    read: false,
  },
  {
    id: '4',
    title: 'มีดีลใหม่ในหมวดหมู่ที่คุณชื่นชอบ',
    description: 'เช็คดีลใหม่ๆ ในหมวดอาหารและเครื่องดื่ม',
    time: '2 วันที่แล้ว',
    read: true,
  },
]

export default function NotificationsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-12 pb-4 bg-gray-100">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
      </div>

      {/* Title */}
      <h1 className="text-center text-xl font-bold text-gray-900 mb-4">การแจ้งเตือน</h1>

      {/* List */}
      <div className="px-4 space-y-3">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div key={n.id} className="bg-white rounded-3xl px-4 py-4 shadow-sm flex items-start gap-3 relative">
            {/* Bell icon */}
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                n.read ? 'bg-gray-100' : 'bg-[#2563EB]'
              }`}
            >
              <svg
                className={`w-5 h-5 ${n.read ? 'text-gray-400' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <p className={`text-sm font-semibold leading-snug ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>
                {n.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.description}</p>
              <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
            </div>

            {/* Unread dot */}
            {!n.read && (
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#2563EB] rounded-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
