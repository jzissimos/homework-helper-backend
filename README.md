# Homework Helper Backend

Voice-powered AI tutor backend built with Next.js 14, Prisma, and OpenAI Realtime API.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in:
   ```env
   DATABASE_URL="postgresql://..."
   OPENAI_API_KEY="sk-..."
   JWT_SECRET="your-secret-key"
   ```

3. **Push database schema:**
   ```bash
   npx prisma db push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server runs at: http://localhost:3000

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository with this code
- Supabase PostgreSQL database

### Steps

1. **Push code to GitHub** (if not already done)

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select `homework-helper-simple/backend` as root directory

3. **Configure Environment Variables in Vercel:**
   Go to Project Settings → Environment Variables and add:

   ```
   DATABASE_URL = postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres
   OPENAI_API_KEY = sk-proj-...
   JWT_SECRET = homework-helper-secret-key-change-in-production-2024
   ```

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Build command: `npx prisma generate && next build`
   - Output directory: `.next`

### Post-Deployment

Test all endpoints using your production URL:

```bash
# Test health (no endpoint yet, but API should respond)
curl https://your-app.vercel.app/api/auth/register

# Register test user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","age":10}'
```

## API Documentation

See [API.md](./API.md) for complete endpoint documentation.

### Available Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/profile` - Get profile
- `PATCH /api/profile` - Update profile
- `GET /api/voices` - List available voices
- `POST /api/conversation` - Start conversation session
- `PATCH /api/conversation/:id/end` - End conversation
- `GET /api/conversations` - Get conversation history

## Database Schema

### User
- id, email, password (hashed)
- name, age, selectedVoice
- totalPoints, timestamps

### Conversation
- id, userId (relation)
- startedAt, endedAt, durationMinutes
- topic, pointsEarned, transcript
- connectionAttempts, hadErrors, errorLog

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **AI**: OpenAI Realtime API
- **Deployment**: Vercel

## Voice System

6 available OpenAI Realtime API voices:
- **shimmer** - Warm and friendly (8-12 years)
- **ballad** - Energetic (10-14 years)
- **alloy** - Balanced and steady (9-13 years)
- **echo** - Gentle and supportive (8-12 years)
- **verse** - Expressive and engaging (9-13 years)
- **sage** - Clear and wise (11-15 years)

## Testing

All endpoints have been tested locally with Katie's account:
- Email: katie@test.com
- Age: 11
- Voice: shimmer
- Points: 10

## Troubleshooting

### Database Connection Error
If you see "invalid port number", make sure special characters in your password are URL-encoded:
- `#` → `%23`
- `^` → `%5E`
- `*` → `%2A`

Example:
```
# Wrong
DATABASE_URL="postgresql://user:T#bXQWB3^S*5gpm@host:5432/db"

# Correct
DATABASE_URL="postgresql://user:T%23bXQWB3%5ES%2A5gpm@host:5432/db"
```

### Prisma Generate Error
Run manually before building:
```bash
npx prisma generate
```

### Build Error on Vercel
Check that build command includes Prisma generation:
```json
{
  "buildCommand": "npx prisma generate && next build"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://...` |
| OPENAI_API_KEY | OpenAI API key | `sk-proj-...` |
| JWT_SECRET | Secret for JWT signing | `random-secret-key` |

## Development Notes

- JWT tokens expire after 30 days
- Passwords hashed with bcrypt (10 rounds)
- OpenAI sessions are ephemeral (expire after use)
- Points automatically accumulate in user totalPoints
- Conversations track errors for debugging

## Next Steps

1. Deploy backend to Vercel ✅
2. Test all endpoints in production
3. Build React Native mobile app with Expo
4. Integrate OpenAI Realtime API WebSocket
5. Test with Katie!
