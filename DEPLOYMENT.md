# 🚀 Deployment Guide for Railway + Vercel

## 📋 **Prerequisites**
1. **GitHub repository** with your code pushed
2. **OpenRouter API key** for Claude 3.5 Sonnet
3. **Railway account** (railway.app)
4. **Vercel account** (vercel.com)

---

## 🚂 **Backend Deployment (Railway)**

### **1. Connect to Railway**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `geopersona` repository
5. Select the `backend` folder (not entire project)
6. Railway will automatically detect and use the Dockerfile

### **2. Set Environment Variables**
In Railway dashboard, add these environment variables:

```bash
# Required: Your OpenRouter API key
OPENAI_API_KEY=your_actual_openrouter_api_key

# CORS origins for Vercel frontend (update with your actual domain)
ALLOWED_ORIGINS=https://your-app.vercel.app

# Rate limiting (5 games per day per IP)
RATE_LIMIT_PER_MIN=25
RATE_LIMIT_PER_DAY=25
```

### **3. Deploy**
1. Railway will automatically build and deploy
2. Wait for deployment to complete
3. Copy your Railway URL (e.g., `https://geopersona-backend.railway.app`)

---

## 🌐 **Frontend Deployment (Vercel)**

### **1. Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your `geopersona` repository
4. Select the `frontend` folder

### **2. Configure Build Settings**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **3. Set Environment Variables**
Add this environment variable:

```bash
# Your Railway backend URL
VITE_API_BASE_URL=https://your-railway-backend-url.railway.app
```

### **4. Deploy**
1. Click "Deploy"
2. Wait for build and deployment
3. Get your Vercel URL (e.g., `https://geopersona.vercel.app`)

---

## 🔗 **Connect Frontend to Backend**

### **1. Update CORS in Railway**
Go back to Railway and update:
```bash
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### **2. Test the Connection**
1. Visit your Vercel app
2. Try to start a game
3. Check browser console for any CORS errors

---

## 🐳 **Docker Configuration**

### **Backend Dockerfile**
- **Base Image**: Python 3.11 slim for optimal size
- **Security**: Non-root user for production safety
- **Health Checks**: Built-in health monitoring
- **Port Handling**: Automatically uses Railway's PORT environment variable

### **Build Process**
```bash
# Local testing
cd backend
docker build -t geopersona-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key geopersona-backend

# Railway automatically handles this
```

---

## 📊 **Rate Limiting Explained**

### **Current Limits:**
- **Per IP Address**: 5 games per day
- **Per Minute**: 5 API calls 
- **Per Day**: 25 API calls (5 games × 5 rounds)

### **What This Means:**
- **Each user** can play 5 complete games per day
- **Multiple users** from different IPs can play simultaneously
- **Scalable** to hundreds of users

---

## 🧪 **Testing Deployment**

### **1. Health Check**
```bash
curl https://your-railway-backend.railway.app/
```

### **2. Test Rate Limiting**
```bash
# Make multiple requests to see rate limiting in action
curl https://your-railway-backend.railway.app/api/game/cities/beginner
```

### **3. Test Frontend**
- Visit your Vercel app
- Play a few games
- Check if rate limiting works

---

## 🔧 **Troubleshooting**

### **Common Issues:**

**CORS Errors:**
- Check `ALLOWED_ORIGINS` in Railway
- Ensure frontend URL is correct

**Rate Limiting Not Working:**
- Check environment variables in Railway
- Restart Railway service

**API Key Errors:**
- Verify `OPENAI_API_KEY` in Railway
- Check OpenRouter dashboard

**Build Failures:**
- Check Railway logs
- Verify Python version compatibility
- **Docker Registry Issues**: If you get "context canceled" errors:
  - Try using the alternative `Dockerfile.alpine` 
  - Change `dockerfilePath` in `railway.json` to `"backend/Dockerfile.alpine"`
  - Alpine images are often more reliable for Railway

---

## 📈 **Scaling**

### **Railway Auto-Scaling:**
- Automatically handles traffic spikes
- Multiple instances for high load
- Global CDN for fast responses

### **Vercel Auto-Scaling:**
- Handles thousands of frontend users
- Global edge network
- Automatic scaling

---

## 💰 **Costs**

### **Railway:**
- **Free tier**: $5/month credit
- **Pay-as-you-go**: After free tier
- **Estimated cost**: $5-15/month for moderate usage

### **Vercel:**
- **Free tier**: Unlimited projects
- **Pro plan**: $20/month for advanced features
- **Estimated cost**: $0/month for basic usage

---

## 🔒 **Security Notes**

### **Rate Limiting:**
- IP-based (not user-based)
- Shared IPs share limits
- Consider session-based for future

### **API Keys:**
- Never commit to GitHub
- Use Railway environment variables
- Rotate keys regularly

---

## 🎯 **Next Steps**

1. **Monitor usage** in Railway dashboard
2. **Set up alerts** for high usage
3. **Consider Redis** for better rate limiting
4. **Add user accounts** for premium features
5. **Implement analytics** for user behavior

---

## 📞 **Support**

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **OpenRouter**: [openrouter.ai/docs](https://openrouter.ai/docs)
