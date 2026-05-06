'use client'

import { useRouter } from 'next/navigation'

const FAQS = [
  {
    q: 'ฉันจะใช้ดีลได้อย่างไร?',
    a: 'เลือกดีลที่ต้องการ กดปุ่ม "ใช้ดีล" และแสดงหน้าจอให้ร้านค้า',
  },
  {
    q: 'ฉันจะเพิ่มในรายการโปรดได้อย่างไร?',
    a: 'กดไอคอนหัวใจในหน้าแรกหรือหน้าดีลของดีล',
  },
  {
    q: 'แอพใช้งานได้ฟรีหรือไม่?',
    a: 'ใช่! RichSave ฟรี 100% สำหรับนักเรียนทุกคน',
  },
]

export default function HelpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
      </div>

      {/* Title */}
      <h1 className="text-center text-xl font-bold text-gray-900 mb-4">ช่วยเหลือและสนับสนุน</h1>

      <div className="px-4 space-y-4">
        {/* FAQ Card */}
        <div className="bg-[#2563EB] rounded-3xl p-5">
          <p className="text-white font-semibold text-base mb-3">คำถามที่พบบ่อย</p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold text-gray-900 mb-1">{faq.q}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-blue-50 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm font-semibold text-gray-900">ติดต่อเรา</p>
          </div>
          <div className="space-y-1.5 text-sm text-gray-700">
            <p>อีเมล: support@richsave.app</p>
            <p>โทร: 02-123-4567</p>
            <p>เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00 น.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
