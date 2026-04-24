#!/bin/bash

# 🚀 Pawesome Quick Deployment Script
# This script helps you deploy your Pawesome system quickly

echo "🚀 Pawesome Quick Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the Pawesome root directory"
    exit 1
fi

echo "✅ Directory structure verified"

# Step 1: Git Setup
echo ""
echo "📁 Step 1: Setting up Git repository..."
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit: Pawesome pet management system"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Step 2: Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 Step 2: Please set up your GitHub repository:"
    echo "1. Go to https://github.com and create a new repository named 'pawesome'"
    echo "2. Run these commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/pawesome.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    read -p "Press Enter after you've set up your GitHub repository..."
else
    echo "✅ Git remote already configured"
fi

# Step 3: Railway Setup
echo ""
echo "🚂 Step 3: Setting up Railway deployment..."
cd backend

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Initialize Railway project
if [ ! -f "railway.toml" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Railway deployment started!"
echo "📊 Check deployment status with: railway logs"
echo "🌐 Open your app with: railway open"

# Step 4: Frontend Setup
echo ""
echo "🟣 Step 4: Setting up Vercel deployment..."
cd ../frontend

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Vercel deployment completed!"

# Step 5: Environment Configuration
echo ""
echo "⚙️ Step 5: Environment Configuration..."
echo "📝 Don't forget to:"
echo "1. Set your REACT_APP_API_URL in Vercel to point to your Railway URL"
echo "2. Configure your Railway environment variables"
echo "3. Run database migrations on Railway"

# Final Instructions
echo ""
echo "🎉 Quick Deployment Completed!"
echo "==============================="
echo ""
echo "Next Steps:"
echo "1. Railway: railway open (to see your backend)"
echo "2. Vercel: Check your email for the frontend URL"
echo "3. Configure environment variables"
echo "4. Test your application"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_TUTORIAL.md"
echo ""
echo "🆘 Need help? Check the troubleshooting section in the tutorial"
