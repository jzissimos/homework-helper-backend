# Deploying to Vercel - Step by Step

Your backend code is now on GitHub: https://github.com/jzissimos/homework-helper-backend

## Steps to Deploy

### 1. Go to Vercel
Visit: https://vercel.com/new

### 2. Import GitHub Repository
- Click "Add New..." → "Project"
- Select "Import Git Repository"
- Find and select: `jzissimos/homework-helper-backend`
- Click "Import"

### 3. Configure Project
**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `.` (leave as default)

**Build Command**: `npx prisma generate && next build`

**Output Directory**: `.next` (should auto-detect)

### 4. Add Environment Variables

Click "Environment Variables" and add these **3 variables**:

#### DATABASE_URL
```
postgresql://postgres.fozhofjgqcnxojwydfty:T%23bXQWB3%5ES%2A5gpm@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```
*(Your Supabase connection string with URL-encoded password)*

#### OPENAI_API_KEY
```
sk-proj-...
```
*(Your OpenAI API key)*

#### JWT_SECRET
```
homework-helper-secret-key-change-in-production-2024
```
*(JWT signing secret)*

**IMPORTANT**:
- Add all 3 variables for "Production", "Preview", and "Development" environments
- Or just check "Production" if you want to deploy to production only first

### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete
- You'll get a URL like: `https://homework-helper-backend-abc123.vercel.app`

### 6. Test Deployment

Once deployed, test with these commands (replace URL with your actual Vercel URL):

```bash
# Test registration
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","age":10}'

# Test login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test voices (no auth required)
curl https://your-app.vercel.app/api/voices
```

## Troubleshooting

### Build Failed
Check build logs in Vercel dashboard. Common issues:
- Prisma generation failed → Make sure build command includes `npx prisma generate`
- Environment variables missing → Double-check all 3 variables are set

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure password special characters are URL-encoded
- Test connection from Supabase dashboard

### API Endpoints Return 404
- Make sure you're using the correct Vercel URL
- Routes should be: `/api/auth/register`, `/api/auth/login`, etc.

## Post-Deployment

1. **Save your Vercel URL** - You'll need it for the mobile app
2. **Test all endpoints** - Use the test commands above
3. **Create Katie's production account** - Register her account in production
4. **Ready for mobile app!** - Backend is now live and ready

## Next Steps

After successful deployment:
1. ✅ Backend deployed to Vercel
2. ✅ All endpoints tested in production
3. → Build React Native mobile app with Expo
4. → Connect mobile app to production backend
5. → Test with Katie on her iPhone!

---

**Questions?** Check [README.md](./README.md) or [API.md](./API.md) for more details.
