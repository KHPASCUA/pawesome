#!/bin/bash

# 🚀 Pawesome Deployment Script
# This script helps you deploy to all platforms

set -e

echo "🚀 Starting Pawesome Deployment..."
echo "================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Pawesome pet management system"
    echo "✅ Git repository initialized"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please set your GitHub remote:"
    echo "git remote add origin https://github.com/yourusername/pawesome.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
php artisan test --env=testing

# Clear caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Commit and push changes
echo "📤 Committing and pushing changes..."
git add .
git commit -m "Deploy: $(date)"
git push origin main

echo "✅ Deployment initiated!"
echo "📊 Check your deployment status:"
echo "  - Vercel: https://vercel.com/dashboard"
echo "  - Railway: https://railway.app/dashboard"
echo "  - Render: https://dashboard.render.com"
echo ""
echo "🎉 Your Pawesome system is being deployed!"
