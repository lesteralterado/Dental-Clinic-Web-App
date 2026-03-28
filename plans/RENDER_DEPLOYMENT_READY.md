# Dental Clinic Backend - Production Deployment (Render)

## Environment Variables

Copy these values when setting up your Render service:

```
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://lesteralteradoroyales_db_user:wsycIxcx37xRVGjl@dental-clinic.pijku6g.mongodb.net/?appName=dental-clinic
MONGODB_USER=lesteralteradoroyales_db_user
MONGODB_PASSWORD=wsycIxcx37xRVGjl

# JWT Authentication
JWT_SECRET=25fd439bdc9161f5321d51e97e8b868b67370618199d0efc72d7d59d374a73d85dff9508404c5dc7bb2cfc0e0e9abec33776cc8377a02a53162e1047e65042f8
JWT_EXPIRES_IN=7d

# Firebase Configuration
FIREBASE_PROJECT_ID=dental-clinic-716f7
FIREBASE_PRIVATE_KEY_ID=a316f49cae39fa8de0567424e4ec99bbbacc71b4
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJc4UCfCTs7Z6S
B4oAw6M3Vz8Y/CkfWjIqW5tM0rNFZst2Rm7JnNKpsxp7cSc9o36JGlhULoG/ZMha
ChNhNAHSy9ZKVMjQrpD4gGJckqrMrIcBhbkaIDUHe2Sj/pJqa444Vi6wHqwNyeNf
KM0UYhD//b72AlCv2snlJ8ZDG+LU0CePANCOcRKCY3Zo+FwXYWtMcINyWXpqns6g
sSr/ZPx3miVNA97I8DCS73/RKNwwUiFwsOwBTo7Q+vrH0LpNSplcS+A1pQBEr6+M
UETFJQiiE/j2XkwlwgQPU/pHoP1Dg8qX4lgrsKRh1p/43O2ppnJ9O4oXsvwm0zQc
1jMqHd7dAgMBAAECggEAE3Jd4DAIxoBnwtQMe+dm3aRD+I77D0Y/OnyOYNukJ6p1
MK0666aCZZRfFZSGQ7qBMA4FgdbdepLpjluTpFoHZQh9Xr6Rhieb4glOtX4JE+oB
vGFizYVXaSn9vKEKFFDesUyMhD7pwAkBtIF1Tqbq2jNuGER/8oHt5Huy9W5/NqjX
Sb1xPJsFoUqFXTdXvRoXtvi4J6qJg05Hd0ITJMtaz/IefwHjcau67a8mpIUc2hzB
GtYaT/PmJP3qhSvoVThGXlufMWR+x8CLm4grOV8hbRgf4XwIlpoicMVhssvzX2Sj
Ck4ECa/nNMqxwSmZ3CBgypHaG0a2UT0eIQ32pXA/wQKBgQD/oloTdoj1+rU8qkGk
OSHZ9sEdQLPjoy+2m2I6/wtUzfOtiatfN1lkobSsv9JwwareNdb4bvG52I2zKNeg
96To8BdOHUQGNQCjHVhtp3c7jKMRU2qsE8GDmMZ3KymCdDO2Jw+a6brXpDRsKpzb
3Ag38Uo0PCjyXxigWvUA4yFaoQKBgQDJvVGKh+HezwOE1n+lyF0dR4FDqXR/f3nT
gzFCt27QTB5thTeAVcuei1tN7pFsIZqwhXrp/+RdUhgfDTOr5IDnNN7Ij2XtPoIt
yyKzyeHjKxubMbwf/nf+DJU4z464SDNkn7gzaAoyw79vrdLauLVbjDhdMl0T/+BQ
3LlpVWA2vQKBgQDZ3lWkxt6dvgme5YBCZYrrSDl4I//s39S3biC/JUVUBp9K5M1Q
vkyKzqK8pFPHU9e7wOkxHOUZvm2uJv33q3g6Kv3BzoF+RMgBPO5zrkmZUBhemNiO
Rdwkux1SzU94Zm74LLxJDDD4vnMLSRoc6595hkT21dsUDmZfrIWpNurjYQKBgGTX
LEY5y+6qvdCNw7qjn9+92WBv+NquZsASaPI3bL3T/rWyDF8rA6AZeqdG5AwP9Bne
buU+0vDO013aJIT8sG5h4CaSf1mKkFnBm3QRKsd5yc/WmXnIokQsF/8QyP9Wn9Hh
gJq5m7dqX2u8kJRiFc1QFvCG9z3C/maNHmUHlxNlAoGBALRxfkVbHtO2iko8YP+x
i4mE+42NdlkQbDdKU40jpN3pCympcaxnK4IPK32t9w2w97lBPU6ce1SsApHyaxT3
h/c2+4JpiRewee7hfKT0eLNnk73iPbcNi0T7FwDNr+hhijzRIjkmogufXlHj/laH
3lMjOrHZ1eyGk6cvXuH8TqIN
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@dental-clinic-716f7.iam.gserviceaccount.com

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lesterroyals041203@gmail.com
SMTP_PASS=gpsr vhil wjiy aymx

# Frontend URL (for CORS)
FRONTEND_URL=https://dental-clinic-frontend.onrender.com
CORS_ORIGINS=https://dental-clinic-frontend.onrender.com

# Application Settings
REMINDER_INTERVAL_MINUTES=30
```

---

## Deployment Steps (Render Dashboard)

### Step 1: Create Web Service
1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Select your GitHub repository (ensure backend folder is included)
4. Configure:
   - **Name**: `dental-clinic-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or Pro when ready)

### Step 2: Add Environment Variables
1. In the Render dashboard, go to "Environment" tab
2. Add each variable from above
3. Important: Make sure `NODE_ENV=production`
4. Click "Save Changes"

### Step 3: Deploy
1. Click "Deploy Latest"
2. Wait for build (may take 2-5 minutes)
3. Check "Logs" tab for any errors

### Step 4: Verify
- Health check: `https://dental-clinic-backend.onrender.com/health`
- Should return: `{ "status": "ok", ... }`

---

## After Backend Deployment

1. **Update Frontend Environment**:
   - Update your frontend's API base URL to point to Render backend
   - Deploy frontend to Render as well

2. **Test**:
   - Login with your credentials
   - Create a patient
   - Schedule an appointment
   - Test password reset email

---

## Troubleshooting

### Build Fails
- Check TypeScript compiles locally: `cd backend && npm run build`
- Ensure all dependencies in package.json

### 503 Error After Deploy
- Service is starting up (wait 30 seconds)
- Check logs for errors

### CORS Errors
- Update `FRONTEND_URL` and `CORS_ORIGINS` to match your frontend URL exactly

### Database Connection Error
- Verify MongoDB Atlas cluster is not paused
- Check network access allows all IPs (0.0.0.0/0)