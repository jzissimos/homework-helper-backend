// GET /api/voices - List all available voices for Katie to choose

import { NextRequest, NextResponse } from 'next/server'
import { AVAILABLE_VOICES, getRecommendedVoicesForAge } from '@/lib/voices'
import { extractToken, verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Optional: Get personalized recommendations if user is authenticated
    const authHeader = request.headers.get('Authorization')
    const token = extractToken(authHeader)

    let recommended: string[] = []

    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { age: true }
        })

        if (user) {
          const recommendedVoices = getRecommendedVoicesForAge(user.age)
          recommended = recommendedVoices.map(v => v.id)
        }
      }
    }

    return NextResponse.json({
      voices: AVAILABLE_VOICES.map(voice => ({
        ...voice,
        recommended: recommended.includes(voice.id)
      }))
    })

  } catch (error) {
    console.error('Voices API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
