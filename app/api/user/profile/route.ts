import { NextRequest, NextResponse } from 'next/server'
import { UserModel } from '@/lib/models'
import { getUserFromToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET /api/user/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userData = await UserModel.findById(user.userId)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = userData

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, location } = body

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        )
      }
    }

    // Update user
    await UserModel.update(user.userId, {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      location: location || undefined,
    })

    const updatedUser = await UserModel.findById(user.userId)
    const { password, ...userWithoutPassword } = updatedUser!

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
