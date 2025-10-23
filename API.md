# Homework Helper API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: TBD (will be deployed to Vercel)

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication

#### `POST /api/auth/register`
Create a new user account (Katie's initial signup).

**Request Body:**
```json
{
  "email": "katie@test.com",
  "password": "katie123",
  "name": "Katie",
  "age": 11
}
```

**Response (200):**
```json
{
  "message": "Account created successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmh2rsfhv000012t03krdjytm",
    "email": "katie@test.com",
    "name": "Katie",
    "age": 11,
    "selectedVoice": "shimmer",
    "totalPoints": 0
  }
}
```

#### `POST /api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "katie@test.com",
  "password": "katie123"
}
```

**Response (200):**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmh2rsfhv000012t03krdjytm",
    "email": "katie@test.com",
    "name": "Katie",
    "age": 11,
    "selectedVoice": "shimmer",
    "totalPoints": 10
  }
}
```

#### `GET /api/auth/me`
Get current authenticated user info.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "cmh2rsfhv000012t03krdjytm",
    "email": "katie@test.com",
    "name": "Katie",
    "age": 11,
    "selectedVoice": "shimmer",
    "totalPoints": 10
  }
}
```

---

### Profile Management

#### `GET /api/profile`
Get user profile (same as `/api/auth/me`).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "cmh2rsfhv000012t03krdjytm",
    "email": "katie@test.com",
    "name": "Katie",
    "age": 11,
    "selectedVoice": "shimmer",
    "totalPoints": 10,
    "createdAt": "2025-10-23T01:55:18.260Z"
  }
}
```

#### `PATCH /api/profile`
Update user profile (name, voice).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Katie Z",
  "selectedVoice": "ballad"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully!",
  "user": {
    "id": "cmh2rsfhv000012t03krdjytm",
    "email": "katie@test.com",
    "name": "Katie Z",
    "age": 11,
    "selectedVoice": "ballad",
    "totalPoints": 10,
    "createdAt": "2025-10-23T01:55:18.260Z"
  }
}
```

---

### Voices

#### `GET /api/voices`
Get all available OpenAI Realtime API voices.

**Query Parameters:**
- `age` (optional): Filter by age for recommendations (e.g., `?age=11`)

**Response (200):**
```json
{
  "voices": [
    {
      "id": "shimmer",
      "name": "Shimmer",
      "description": "Warm and friendly, great for younger students",
      "sampleText": "Hi Katie! I'm here to help you learn and figure things out together.",
      "ageRange": "8-12",
      "gender": "female",
      "personality": "Encouraging, warm, patient",
      "recommended": true
    },
    {
      "id": "ballad",
      "name": "Ballad",
      "description": "Clear and energetic, perfect for math and science",
      "sampleText": "Hey there! Let's tackle this problem step by step. You've got this!",
      "ageRange": "10-14",
      "gender": "female",
      "personality": "Energetic, enthusiastic, motivating",
      "recommended": true
    },
    {
      "id": "alloy",
      "name": "Alloy",
      "description": "Balanced and steady, good for focused learning",
      "sampleText": "Hi! I'm ready to help you understand this. Let's break it down together.",
      "ageRange": "9-13",
      "gender": "neutral",
      "personality": "Calm, steady, reliable",
      "recommended": true
    },
    {
      "id": "echo",
      "name": "Echo",
      "description": "Gentle and supportive, great for reading and writing",
      "sampleText": "Hello! Take your time, and let's work through this at your pace.",
      "ageRange": "8-12",
      "gender": "neutral",
      "personality": "Gentle, supportive, patient",
      "recommended": true
    },
    {
      "id": "verse",
      "name": "Verse",
      "description": "Expressive and engaging, perfect for storytelling",
      "sampleText": "Hey! This is going to be fun. Let me help you discover the answer!",
      "ageRange": "9-13",
      "gender": "neutral",
      "personality": "Expressive, engaging, creative",
      "recommended": true
    },
    {
      "id": "sage",
      "name": "Sage",
      "description": "Clear and wise, good for older students",
      "sampleText": "Hi there. Let's think critically about this problem together.",
      "ageRange": "11-15",
      "gender": "neutral",
      "personality": "Professional, clear, focused",
      "recommended": true
    }
  ]
}
```

---

### Conversations

#### `POST /api/conversation`
Start a new conversation session with OpenAI Realtime API.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "conversationId": "cmh2s1g0d000312a8ha267ivb",
  "sessionToken": "ek_68f98cab33808191b39bb6f355f08346",
  "voice": "shimmer",
  "userName": "Katie",
  "userAge": 11
}
```

**Mobile App Usage:**
1. Call this endpoint to get `sessionToken`
2. Connect to OpenAI Realtime API WebSocket with the session token
3. When conversation ends, call `PATCH /api/conversation/:id/end`

#### `PATCH /api/conversation/:id/end`
End a conversation and save results.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "durationMinutes": 5,
  "topic": "Math - Fractions",
  "pointsEarned": 10,
  "transcript": { "messages": [...] },
  "hadErrors": false,
  "errorLog": null
}
```

**Response (200):**
```json
{
  "message": "Conversation ended successfully",
  "conversation": {
    "id": "cmh2s1g0d000312a8ha267ivb",
    "startedAt": "2025-10-23T02:02:18.829Z",
    "endedAt": "2025-10-23T02:02:27.858Z",
    "durationMinutes": 5,
    "topic": "Math - Fractions",
    "pointsEarned": 10
  }
}
```

**Side Effects:**
- Updates user's `totalPoints` by `pointsEarned`

#### `GET /api/conversations`
Get conversation history for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional, default: 20): Number of conversations to return
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "cmh2s1g0d000312a8ha267ivb",
      "startedAt": "2025-10-23T02:02:18.829Z",
      "endedAt": "2025-10-23T02:02:27.858Z",
      "durationMinutes": 5,
      "topic": "Math - Fractions",
      "pointsEarned": 10,
      "hadErrors": false
    },
    {
      "id": "cmh2s0l7n000112a8yndh6quo",
      "startedAt": "2025-10-23T02:01:38.915Z",
      "endedAt": "2025-10-23T02:01:39.280Z",
      "durationMinutes": null,
      "topic": null,
      "pointsEarned": 0,
      "hadErrors": true
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## OpenAI Realtime API Integration

The mobile app will connect directly to OpenAI's Realtime API WebSocket:

1. **Get Session Token**: Call `POST /api/conversation` to get ephemeral `sessionToken`
2. **Connect to WebSocket**:
   - URL: `wss://api.openai.com/v1/realtime`
   - Headers: `Authorization: Bearer <sessionToken>`
3. **Voice Conversation**: Bidirectional audio streaming
4. **End Session**: Call `PATCH /api/conversation/:id/end` with results

See OpenAI Realtime API docs: https://platform.openai.com/docs/guides/realtime

---

## Database Schema

### User
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // bcrypt hashed
  name          String
  age           Int
  selectedVoice String   @default("shimmer")
  totalPoints   Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  conversations Conversation[]
}
```

### Conversation
```prisma
model Conversation {
  id                 String    @id @default(cuid())
  userId             String
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  startedAt          DateTime  @default(now())
  endedAt            DateTime?
  durationMinutes    Int?
  topic              String?
  pointsEarned       Int       @default(0)
  transcript         Json?
  connectionAttempts Int       @default(1)
  hadErrors          Boolean   @default(false)
  errorLog           Json?
}
```
