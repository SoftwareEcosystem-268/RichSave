'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }

    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user))
        router.back()
      } else {
        setError(data.error || 'บันทึกไม่สำเร็จ')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  const initial = formData.name.charAt(0).toUpperCase()

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
      <h1 className="text-center text-xl font-bold text-gray-900 mb-6">แก้ไขโปรไฟล์</h1>

      {/* Card */}
      <div className="mx-4 bg-white rounded-3xl p-6 shadow-sm">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#2563EB] flex items-center justify-center mb-3">
            <span className="text-white text-3xl font-bold">{initial}</span>
          </div>
          <button className="text-[#2563EB] text-sm font-medium">เปลี่ยนรูปโปรไฟล์</button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">อีเมล</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB] bg-white"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-4 bg-[#2563EB] text-white font-semibold rounded-2xl disabled:opacity-60"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </div>
    </div>
  )
}
