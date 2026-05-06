'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TAGS = [
  'แอพใช้งานง่าย',
  'ติดเยอะมาก',
  'ควรเพิ่มร้านอาหาร',
  'ประหยัดเงินได้จริง',
  'อยากให้มี Dark Mode',
  'การแจ้งเตือนดีมาก',
  'ร้านค้าน้อยเกินไป',
]

export default function FeedbackPage() {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [text, setText] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Blue header */}
      <div className="bg-[#2563EB] px-4 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-lg">ส่งความคิดเห็น</h1>
        </div>

        {/* Banner */}
        <div className="mt-3">
          <p className="text-white font-semibold text-base">เราอยากรับฟังความคิดเห็นจากคุณ</p>
          <p className="text-blue-200 text-xs mt-1 leading-relaxed">
            ความคิดเห็นของคุณช่วยให้เราพัฒนา RichSave ให้ดียิ่งขึ้นทุกด้วยความ
            จะถูกนำไปพิจารณาอย่างจริงจัง
          </p>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Star rating */}
        <div className="bg-white rounded-3xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">คุณพอใจกับ RichSave แค่ไหน?</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg
                  className="w-10 h-10 transition-colors"
                  fill={(hovered || rating) >= star ? '#FBBF24' : 'none'}
                  stroke={(hovered || rating) >= star ? '#FBBF24' : '#D1D5DB'}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Text area */}
        <div className="bg-white rounded-3xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">เขียนความคิดเห็น (อย่างน้อย 10 ตัวอักษร)</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder="บอกเราว่าคุณคิดอย่างไร เราอยากฟัง... 🙂"
            rows={5}
            className="w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-100 rounded-2xl p-3 outline-none focus:border-[#2563EB] resize-none bg-gray-50"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{text.length}/500</p>
        </div>

        {/* Tags */}
        <div className="bg-blue-50 rounded-3xl p-5">
          <p className="text-sm font-semibold text-gray-800 mb-3">ข้อเสนอแนะด้วย (คลิกเพื่อเลือก)</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
