'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

interface NavigationProps {
  isAuthenticated?: boolean
  userName?: string
}

export default function Navigation({ isAuthenticated = false, userName = '' }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const hideNavPaths = ['/login', '/signup', '/forgot-password', '/reset-password']
  if (hideNavPaths.includes(pathname)) return null

  const navItems = [
    { label: 'หน้าหลัก',   href: '/deals',     icon: '/alpha/navbar/home.svg',    iconActive: '/alpha/navbar/home-active.svg' },
    { label: 'ใกล้ฉัน',    href: '/nearby',    icon: '/alpha/navbar/mark.svg',    iconActive: '/alpha/navbar/mark-active.svg' },
    { label: 'รายการโปรด', href: '/favorites', icon: '/alpha/navbar/love.svg',    iconActive: '/alpha/navbar/love-active.svg' },
    { label: 'ประหยัด',    href: '/savings',   icon: '/alpha/navbar/save.svg',    iconActive: '/alpha/navbar/save-active.svg' },
    { label: 'โปรไฟล์',   href: '/profile',   icon: '/alpha/navbar/profile.svg', iconActive: '/alpha/navbar/profile-active.svg' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/alpha/logo.svg" alt="RichSave" width={40} height={40} style={{ width: 40, height: 'auto' }} />
            <Image src="/alpha/message.svg" alt="RichSave" width={110} height={24} />
          </div>

          {/* User */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
                  <span className="text-sm font-semibold" style={{ color: '#2563EB' }}>
                    {userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700 font-medium hidden sm:block">{userName}</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-gray-700 font-medium px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="text-sm text-white font-medium px-4 py-2 rounded-xl transition-colors"
                style={{ backgroundColor: '#2563EB' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
                >
                  <div className="w-6 h-6 relative">
                    <Image src={isActive ? item.iconActive : item.icon} alt={item.label} fill className="object-contain" />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: isActive ? '#2563EB' : '#9CA3AF' }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
