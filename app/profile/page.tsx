'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/Navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ coupons: 0, savings: 0, favorites: 0 })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
    const saved = localStorage.getItem('avatarUrl')
    if (saved) setAvatarUrl(saved)
  }, [router])

  const fetchProfile = async () => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }

    try {
      const [profileRes, savingsRes, favRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/savings'),
        fetch('/api/user/favorites'),
      ])
      const profileData = await profileRes.json()
      if (profileData.success) {
        setUser(profileData.user)
      }
      const savingsData = savingsRes.ok ? await savingsRes.json() : null
      const favData = favRes.ok ? await favRes.json() : null
      setStats({
        coupons: savingsData?.data?.dealsRedeemed ?? 0,
        savings: savingsData?.data?.totalSavings ?? 0,
        favorites: favData?.favorites?.length ?? 0,
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setMessage(null)

    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    if (passwordData.new.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setShowPasswordModal(false)
        setPasswordData({ current: '', new: '', confirm: '' })
        setMessage({ type: 'success', text: 'Password changed successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Navigation isAuthenticated={!!user} userName={user?.name} />

      {/* Header */}
      <div className="px-6 pt-20 pb-4 bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile Info Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 bg-[#2563EB] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (ev) => {
                      const url = ev.target?.result as string
                      setAvatarUrl(url)
                      localStorage.setItem('avatarUrl', url)
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-500">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm text-gray-500">{user.phone}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Stats Row — 3 separate cards */}
        <div className="flex gap-3 mt-3">
          <div className="flex-1 bg-white rounded-2xl py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stats.coupons}</p>
            <p className="text-xs text-gray-500 mt-0.5">ดีลที่ใช้</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">฿{stats.savings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">ประหยัดได้</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
            <p className="text-xs text-gray-500 mt-0.5">รายการโปรด</p>
          </div>
        </div>

        {/* Section: บัญชี */}
        <div>
          <p className="text-sm font-semibold text-gray-500 px-2 mb-2">บัญชี</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
            <MenuItem icon="/alpha/profile/setting.svg" label="แก้ไขโปรไฟล์" onClick={() => router.push('/profile/edit')} />
            <MenuItem icon="/alpha/profile/noti.svg" label="การแจ้งเตือน" badge={3} onClick={() => router.push('/profile/notifications')} />
          </div>
        </div>

        {/* Section: การตั้งค่า */}
        <div>
          <p className="text-sm font-semibold text-gray-500 px-2 mb-2">การตั้งค่า</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
            <MenuItem icon="/alpha/profile/priv.svg" label="ความเป็นส่วนตัว" onClick={() => router.push('/privacy')} />
            <MenuItem icon="/alpha/profile/lock.svg" label="เปลี่ยนรหัสผ่าน" onClick={() => setShowPasswordModal(true)} />
          </div>
        </div>

        {/* Section: อื่นๆ */}
        <div>
          <p className="text-sm font-semibold text-gray-500 px-2 mb-2">อื่นๆ</p>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-100">
            <MenuItem icon="/alpha/profile/help.svg" label="ช่วยเหลือและสนับสนุน" onClick={() => router.push('/profile/help')} />
            <MenuItem icon="/alpha/profile/question.svg" label="ส่งความคิดเห็น" onClick={() => router.push('/profile/feedback')} />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-3xl border-2 border-red-500 text-red-500 font-semibold flex items-center justify-center gap-2 bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ออกจากระบบ
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">เวอร์ชันแอพ 1.0.0</p>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-5">เปลี่ยนรหัสผ่าน</h3>
            {message && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}
            <div className="space-y-3">
              <input type="password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB]" placeholder="รหัสผ่านปัจจุบัน" />
              <input type="password" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB]" placeholder="รหัสผ่านใหม่" />
              <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2563EB]" placeholder="ยืนยันรหัสผ่านใหม่" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowPasswordModal(false); setPasswordData({ current: '', new: '', confirm: '' }); setMessage(null) }}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium text-sm">
                ยกเลิก
              </button>
              <button onClick={handleChangePassword}
                className="flex-1 py-3 rounded-2xl bg-[#2563EB] text-white font-medium text-sm">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, badge, onClick }: { icon: string; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-6 py-6 active:bg-gray-50">
      <div className="flex items-center gap-5">
        <Image src={icon} width={44} height={44} alt={label} />
        <span className="text-base font-medium text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge != null && (
          <span className="min-w-[20px] h-5 px-1.5 bg-[#2563EB] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
