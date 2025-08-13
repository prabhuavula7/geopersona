# 🚀 GeoPersona Deployment Guide

## ✅ Backend (Railway) - COMPLETED
Your backend is successfully deployed on Railway! 🎉

**Current Status**: ✅ Deployed and running
**Health Checks**: ✅ Passing
**Port**: 8080 (Railway managed)

## 🌐 Frontend (Vercel) - Next Steps

### 1. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to root directory (where vercel.json is located)
cd /path/to/geopersona

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set project name (e.g., geopersona-frontend)
# - Vercel will automatically use the root vercel.json configuration
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. **Important**: Import your GitHub repository (select the entire repository, not just frontend folder)
4. **Build settings are pre-configured**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Framework: Vite

### 2. Configure Environment Variables

After deploying to Vercel, set these environment variables in your Vercel project:

```bash
VITE_API_BASE_URL=https://your-railway-app.railway.app
```

**To find your Railway URL:**
1. Go to your Railway dashboard
2. Click on your GeoPersona service
3. Copy the generated domain (e.g., `https://geopersona-production-1234.up.railway.app`)

### 3. Update Railway CORS

Once you have your Vercel domain, update the `ALLOWED_ORIGINS` in Railway:

1. Go to Railway dashboard → Your service → Variables
2. Update `ALLOWED_ORIGINS`:
   ```
   http://localhost:5173,https://your-vercel-domain.vercel.app
   ```
3. Redeploy the backend

## 🔧 Configuration Files

### Frontend Environment Variables
Create `.env.local` in frontend directory for local development:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Environment Variables (Railway)
- `PYTHON_VERSION`: 3.11
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `PORT`: Automatically set by Railway (8080)

## 🧪 Testing

### Local Development
```bash
# Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

### Production Testing
1. Test backend endpoints: `https://your-railway-app.railway.app/startup`
2. Test frontend: `https://your-vercel-domain.vercel.app`
3. Verify API calls work between frontend and backend

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `ALLOWED_ORIGINS` includes your Vercel domain
   - Check that the domain is exactly correct (including https://)

2. **API Connection Failures**
   - Verify `VITE_API_BASE_URL` is set correctly in Vercel
   - Check that Railway backend is running and healthy

3. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check that build command works locally: `npm run build`

### Health Check Endpoints
- `/startup`: Simple health check (Railway uses this)
- `/health`: Basic health status
- `/ready`: Comprehensive health check
- `/ping`: Network test endpoint

## 📱 Final URLs

After deployment, you'll have:
- **Backend API**: `https://your-railway-app.railway.app`
- **Frontend App**: `https://your-vercel-domain.vercel.app`
- **API Documentation**: `https://your-railway-app.railway.app/docs`

## 🎯 Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Configure environment variables
3. ✅ Update Railway CORS settings
4. ✅ Test end-to-end functionality
5. 🎉 Share your live GeoPersona game!

## 🔗 Useful Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GeoPersona Backend API](https://your-railway-app.railway.app)
- [GeoPersona Frontend](https://your-vercel-domain.vercel.app)
