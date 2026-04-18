import { NextRequest, NextResponse } from 'next/server'
import { OTPModel } from '@/lib/models'
import { sendOTPEmail } from '@/lib/email'

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    await OTPModel.create(email, otp)

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp)

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
