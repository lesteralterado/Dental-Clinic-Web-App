# Render Deployment Plan

## Prerequisites

Before deploying, ensure you have:
1. GitHub repository with the backend code pushed
2. MongoDB Atlas account with a cluster created (free tier works)
3. Firebase project configured (for notifications)
4. Gmail account with App Password for SMTP

---

## Step 1: Prepare Repository

Ensure your backend has these scripts in [`backend/package.json`](backend/package.json:9):

```json
"scripts": {
  "build": "tsc",
  "start:prod": "NODE_ENV=production node dist/server.js"
}
```

---

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (or use existing)
3. Create a database user:
   - Username: `dental-clinic`
   - Password: Generate a secure password
4. Network Access: Add IP `0.0.0.0/0` (allows all IPs)
5. Get connection string:
   ```
   mongodb+srv://dental-clinic:<password>@cluster.mongodb.net/dental-clinic?retryWrites=true&w=majority
   ```

---

## Step 3: Configure Environment Variables

Create `.env.production` with these values:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://dental-clinic:<password>@cluster.mongodb.net/dental-clinic?retryWrites=true&w=majority

# JWT (Generate via: openssl rand -hex 64)
JWT_SECRET=<64-character-secret>

# Firebase (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Email (Use Gmail App Password, not regular password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-frontend.onrender.com

# CORS
CORS_ORIGINS=https://your-frontend.onrender.com
```

---

## Step 4: Deploy to Render

### 4.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `dental-clinic-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or Pro when ready)

### 4.2 Add Environment Variables

In Render dashboard for your service:
1. Go to "Environment" tab
2. Add each environment variable from Step 3
3. Click "Save Changes"

### 4.3 Deploy

1. Click "Deploy Latest"
2. Wait for build to complete
3. Check logs for successful startup

---

## Step 5: Verify Deployment

### Health Check
Visit: `https://dental-clinic-backend.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

### Test API
Visit: `https://dental-clinic-backend.onrender.com/api/appointments`

Expected: JSON response or proper error (not 404)

---

## Step 6: Update Frontend

After backend is deployed, update frontend to use production API:

1. Create `src/lib/api/production.js`:
```javascript
const API_BASE_URL = 'https://dental-clinic-backend.onrender.com/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  PATIENTS: `${API_BASE_URL}/patients`,
  APPOINTMENTS: `${API_BASE_URL}/appointments`,
  // ... other endpoints
};
```

2. Update your API client to use production URL in production

---

## Important Notes

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- For always-on, upgrade to Pro plan ($7/month)

### Background Jobs
- On free tier, node-cron jobs may not run reliably when service sleeps
- Consider using Render's cron feature or upgrade to Pro

### SSL
- Render provides automatic SSL for all web services

---

## Troubleshooting

### Build Fails
- Check TypeScript compilation: `npm run build` locally
- Ensure all dependencies are in `package.json`

### Service Won't Start
- Check environment variables are set
- Verify MongoDB connection string is correct
- Check logs in Render dashboard

### CORS Errors
- Update `CORS_ORIGINS` to match your frontend URL exactly
- Include `https://` protocol