'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    location: true,
    searchHistory: true,
    pushNotifications: true,
    emailPromo: false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
      </div>

      <h1 className="text-center text-xl font-bold text-gray-900 mb-4">ความเป็นส่วนตัว</h1>

      <div className="mx-4 bg-white rounded-3xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <PrivacyRow label="แสดงตำแหน่งปัจจุบัน" checked={settings.location} onChange={() => toggle('location')} />
        <PrivacyRow label="บันทึกประวัติการค้นหา" checked={settings.searchHistory} onChange={() => toggle('searchHistory')} />
        <PrivacyRow label="รับการแจ้งเตือนแบบ Push" checked={settings.pushNotifications} onChange={() => toggle('pushNotifications')} />
        <PrivacyRow label="รับอีเมลโปรโมชัน" checked={settings.emailPromo} onChange={() => toggle('emailPromo')} />
      </div>
    </div>
  )
}

function PrivacyRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-gray-800">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

