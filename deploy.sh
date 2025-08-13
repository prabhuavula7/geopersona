#!/bin/bash

# 🚀 GeoPersona Deployment Script
# This script helps you push your project to GitHub for Railway + Vercel deployment

echo "🌍 GeoPersona Deployment Setup"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check git status
echo ""
echo "📊 Current Git Status:"
git status

echo ""
echo "🔧 Next Steps:"
echo "1. Add your files: git add ."
echo "2. Commit changes: git commit -m 'Initial commit: GeoPersona game ready for deployment'"
echo "3. Add remote: git remote add origin https://github.com/YOUR_USERNAME/geopersona.git"
echo "4. Push to GitHub: git push -u origin main"
echo ""
echo "📚 After pushing to GitHub:"
echo "1. Connect to Railway (railway.app) - deploy backend folder"
echo "2. Connect to Vercel (vercel.com) - deploy frontend folder"
echo "3. Follow the DEPLOYMENT.md guide for detailed steps"
echo ""
echo "🎯 Your project is ready for deployment!"
