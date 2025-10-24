// GET/PATCH /api/profile - Katie's profile management

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { extractToken, verifyToken } from '@/lib/auth'
import { getVoiceById } from '@/lib/voices'

// Middleware to authenticate user
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return { error: 'No token provided', status: 401 }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      age: true,
      selectedVoice: true,
      totalPoints: true,
      createdAt: true,
    }
  })

  if (!user) {
    return { error: 'User not found', status: 404 }
  }

  return { user }
}

// GET /api/profile - Get Katie's profile
export async function GET(request: NextRequest) {
  try {
    const result = await authenticateRequest(request)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    return NextResponse.json({ user: result.user })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update Katie's profile (voice, etc.)
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  selectedVoice: z.string().optional(),
  // We won't allow updating age or email for security
})

export async function PATCH(request: NextRequest) {
  try {
    const result = await authenticateRequest(request)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    // Validate voice if provided
    if (data.selectedVoice) {
      const voice = getVoiceById(data.selectedVoice)
      if (!voice) {
        return NextResponse.json(
          { error: `Invalid voice: ${data.selectedVoice}. Must be one of: shimmer, nova, alloy, echo, fable, onyx` },
          { status: 400 }
        )
      }
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: result.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        selectedVoice: true,
        totalPoints: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully!',
      user: updated
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
