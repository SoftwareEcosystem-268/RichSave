'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  useEffect(() => {
    // Check if user has accepted privacy policy
    const privacyAccepted = localStorage.getItem('privacyAccepted')
    if (privacyAccepted) {
      setAcceptedPrivacy(true)
    }
  }, [])

  const handleGetStarted = () => {
    if (acceptedPrivacy) {
      router.push('/deals')
    } else {
      setShowPrivacy(true)
    }
  }

  const handleAcceptPrivacy = () => {
    localStorage.setItem('privacyAccepted', 'true')
    setAcceptedPrivacy(true)
    setShowPrivacy(false)
    router.push('/deals')
  }

  return (
    <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/alpha/logo.svg" alt="RichSave" width={44} height={44} />
              <Image src="/alpha/message.svg" alt="RichSave" width={120} height={26} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/login')}
                className="px-5 py-2 text-gray-700 font-medium transition-colors hover:opacity-80"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="px-5 py-2 rounded-xl text-white font-medium transition-colors"
                style={{ backgroundColor: '#2563EB' }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Save Smart,
                <span style={{ color: '#2563EB' }}> Live Rich</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover amazing deals near you, track your savings, and make every dollar count. Join thousands of smart savers today.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={handleGetStarted} className="text-lg px-8 py-4 rounded-2xl text-white font-semibold transition-colors" style={{ backgroundColor: '#2563EB' }}>
                  Get Started Free
                </button>
                <button
                  onClick={() => router.push('/deals')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Browse Deals
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#2563EB' }}>10K+</div>
                  <div className="text-gray-600">Active Deals</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#2563EB' }}>$2M+</div>
                  <div className="text-gray-600">User Savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold" style={{ color: '#2563EB' }}>50K+</div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-softer p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="rounded-2xl p-6 text-white mb-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  <div className="text-sm opacity-80 mb-1">You saved this month</div>
                  <div className="text-4xl font-bold">$247.50</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      🍕
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">50% off Pizza</div>
                      <div className="text-sm text-gray-500">Domino's</div>
                    </div>
                    <div className="font-semibold" style={{ color: '#2563EB' }}>$12</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      👟
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">30% off Sneakers</div>
                      <div className="text-sm text-gray-500">Nike Store</div>
                    </div>
                    <div className="font-semibold" style={{ color: '#2563EB' }}>$45</div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      🛒
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Buy 1 Get 1 Free</div>
                      <div className="text-sm text-gray-500">Whole Foods</div>
                    </div>
                    <div className="font-semibold" style={{ color: '#2563EB' }}>$28</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose RichSave?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Deals</h3>
                <p className="text-gray-600">Search thousands of deals from your favorite stores and brands</p>
              </div>
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Nearby Deals</h3>
                <p className="text-gray-600">Discover deals around you with location-based search</p>
              </div>
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Savings</h3>
                <p className="text-gray-600">Monitor your savings with detailed charts and insights</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-softer">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy & Terms</h2>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <h3 className="font-semibold text-lg mb-3">Privacy Policy</h3>
              <p className="text-gray-600 mb-4">
                At RichSave, we take your privacy seriously. We collect minimal information necessary to provide you with personalized deals and savings tracking.
              </p>

              <h4 className="font-semibold mb-2">Information We Collect:</h4>
              <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                <li>Email address and name for account creation</li>
                <li>Location data (with your consent) for nearby deals</li>
                <li>Savings data to track your progress</li>
                <li>Favorited deals for your convenience</li>
              </ul>

              <h4 className="font-semibold mb-2">How We Use Your Data:</h4>
              <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                <li>To provide personalized deal recommendations</li>
                <li>To show deals near your location</li>
                <li>To track and display your savings</li>
                <li>To improve our services</li>
              </ul>

              <h4 className="font-semibold mb-2">Data Security:</h4>
              <p className="text-gray-600 mb-4">
                We use industry-standard encryption and security measures to protect your data. Your password is securely hashed and never stored in plain text.
              </p>

              <h3 className="font-semibold text-lg mb-3 mt-6">Terms of Service</h3>
              <p className="text-gray-600 mb-4">
                By using RichSave, you agree to these terms:
              </p>
              <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                <li>Deals are provided by third-party merchants and subject to their terms</li>
                <li>We strive for accuracy but cannot guarantee deal availability</li>
                <li>Users must be at least 13 years old</li>
                <li>Account sharing is prohibited</li>
              </ul>

              <p className="text-gray-600 mb-4">
                Last updated: March 2026
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleAcceptPrivacy}
                className="btn-primary flex-1"
              >
                Accept & Continue
              </button>
              <button
                onClick={() => setShowPrivacy(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
