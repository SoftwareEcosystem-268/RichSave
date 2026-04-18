import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

interface SendEmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  // If no API key is configured, log to console (for development)
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 [EMAIL MOCK]', { to, subject, text })
    return { success: true, mocked: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'RichSave <onboarding@resend.dev>',
      to,
      subject,
      html: html || text || '',
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">$</span>
              </div>
              <span style="font-size: 24px; font-weight: bold; color: #1F2937;">RichSave</span>
            </div>
          </div>

          <!-- Content -->
          <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1F2937; text-align: center;">
            รหัสยืนยันของคุณ
          </h1>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #6B7280; text-align: center;">
            ใช้รหัสยืนยัน 6 หลักนี้เพื่อรีเซ็ตรหัสผ่านของคุณ
          </p>

          <!-- OTP Code -->
          <div style="background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border: 2px solid #2563EB; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #2563EB; letter-spacing: 8px;">${otp}</span>
          </div>

          <p style="margin: 8px 0; font-size: 14px; color: #6B7280; text-align: center;">
            รหัสนี้จะหมดอายุใน 10 นาที
          </p>

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 14px; color: #9CA3AF; text-align: center;">
              หากคุณไม่ได้รีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #9CA3AF; text-align: center;">
          © 2025 RichSave. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'รหัสยืนยันสำหรับรีเซ็ตรหัสผ่าน - RichSave',
    html,
  })
}
