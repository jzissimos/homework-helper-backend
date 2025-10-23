// Voice Metadata - All available OpenAI voices for Katie to choose from

export interface Voice {
  id: string
  name: string
  description: string
  sampleText: string
  ageRange: string
  gender: string
  personality: string
}

/**
 * Available OpenAI Realtime API voices
 * Curated for 11-year-old Katie and similar age range
 * Updated with current Realtime API voices as of Dec 2024
 */
export const AVAILABLE_VOICES: Voice[] = [
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Warm and friendly, great for younger students',
    sampleText: 'Hi Katie! I\'m here to help you learn and figure things out together.',
    ageRange: '8-12',
    gender: 'female',
    personality: 'Encouraging, warm, patient'
  },
  {
    id: 'ballad',
    name: 'Ballad',
    description: 'Clear and energetic, perfect for math and science',
    sampleText: 'Hey there! Let\'s tackle this problem step by step. You\'ve got this!',
    ageRange: '10-14',
    gender: 'female',
    personality: 'Energetic, enthusiastic, motivating'
  },
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Balanced and steady, good for focused learning',
    sampleText: 'Hi! I\'m ready to help you understand this. Let\'s break it down together.',
    ageRange: '9-13',
    gender: 'neutral',
    personality: 'Calm, steady, reliable'
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Gentle and supportive, great for reading and writing',
    sampleText: 'Hello! Take your time, and let\'s work through this at your pace.',
    ageRange: '8-12',
    gender: 'neutral',
    personality: 'Gentle, supportive, patient'
  },
  {
    id: 'verse',
    name: 'Verse',
    description: 'Expressive and engaging, perfect for storytelling',
    sampleText: 'Hey! This is going to be fun. Let me help you discover the answer!',
    ageRange: '9-13',
    gender: 'neutral',
    personality: 'Expressive, engaging, creative'
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Clear and wise, good for older students',
    sampleText: 'Hi there. Let\'s think critically about this problem together.',
    ageRange: '11-15',
    gender: 'neutral',
    personality: 'Professional, clear, focused'
  }
]

/**
 * Get voice by ID
 */
export function getVoiceById(id: string): Voice | undefined {
  return AVAILABLE_VOICES.find(v => v.id === id)
}

/**
 * Get recommended voices for age
 */
export function getRecommendedVoicesForAge(age: number): Voice[] {
  return AVAILABLE_VOICES.filter(voice => {
    const [min, max] = voice.ageRange.split('-').map(Number)
    return age >= min && age <= max
  })
}
