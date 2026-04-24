# 🚀 Pawesome Deployment Guide

This guide will help you deploy the Pawesome pet management system using Vercel, Railway, and Render via GitHub.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Platform Overview](#platform-overview)
- [GitHub Setup](#github-setup)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment](#railway-deployment)
- [Render Deployment](#render-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have:

- **GitHub Account**: For version control and CI/CD
- **Vercel Account**: For frontend deployment
- **Railway Account**: For backend deployment with database
- **Render Account**: Alternative backend deployment option
- **Domain Name**: (Optional) For custom domain setup
- **SSL Certificate**: (Recommended) For HTTPS

## 🌐 Platform Overview

### Vercel (Frontend)
- **Purpose**: Static frontend deployment
- **Best for**: React/Vue.js frontend
- **Pricing**: Free tier available
- **Features**: CDN, SSL, Custom domains

### Railway (Backend + Database)
- **Purpose**: Backend API with database
- **Best for**: Laravel API with MySQL
- **Pricing**: Free tier with limitations
- **Features**: Built-in MySQL, Redis, CI/CD

### Render (Alternative Backend)
- **Purpose**: Alternative backend deployment
- **Best for**: Production-grade hosting
- **Pricing**: Free tier available
- **Features**: PostgreSQL, Redis, Private services

## 📁 GitHub Setup

### 1. Initialize Repository
```bash
git init
git add .
git commit -m "Initial commit: Pawesome pet management system"
```

### 2. Create GitHub Repository
```bash
git remote add origin https://github.com/yourusername/pawesome.git
git branch -M main
git push -u origin main
```

### 3. Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

**For Vercel:**
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

**For Railway:**
- `RAILWAY_TOKEN`: Your Railway API token
- `RAILWAY_SERVICE_ID`: Your Railway service ID

**For Render:**
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

## 🟣 Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Configure Project
```bash
cd backend
vercel link
```

### 4. Deploy to Vercel
```bash
vercel --prod
```

### 5. Vercel Configuration
The `vercel.json` file is already configured with:
- PHP runtime
- Environment variables
- Build commands
- Health checks

### 6. Custom Domain (Optional)
```bash
vercel domains add yourdomain.com
```

## 🚂 Railway Deployment

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project
```bash
cd backend
railway init
```

### 4. Configure Services
The `railway.toml` file is already configured with:
- Laravel application
- MySQL database
- Redis cache
- Environment variables

### 5. Deploy to Railway
```bash
railway up
```

### 6. Get Project URL
```bash
railway open
```

## 🎨 Render Deployment

### 1. Connect GitHub to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `pawesome` repository

### 2. Configure Service
- **Name**: `pawesome-backend`
- **Environment**: `PHP`
- **Build Command**: `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize`
- **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`

### 3. Add Database
1. Click "New +" → "PostgreSQL"
2. Name: `pawesome-db`
3. Connect to your backend service

### 4. Add Redis (Optional)
1. Click "New +" → "Redis"
2. Name: `pawesome-redis`
3. Connect to your backend service

### 5. Environment Variables
Add these environment variables in Render dashboard:
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=your-generated-key
APP_URL=https://your-service.onrender.com
DB_CONNECTION=pgsql
DB_HOST=pawesome-db
DB_DATABASE=pawesome
DB_USERNAME=pawesome
DB_PASSWORD=your-db-password
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=pawesome-redis
```

## 🔐 Environment Variables

### Required Variables
```env
# Application
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql  # or pgsql for Render
DB_HOST=your-db-host
DB_PORT=3306  # or 5432 for PostgreSQL
DB_DATABASE=pawesome
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# Email (Optional)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Generate Application Key
```bash
php artisan key:generate --show
```

## 🗄️ Database Setup

### 1. Run Migrations
```bash
php artisan migrate --force
```

### 2. Seed Data (Optional)
```bash
php artisan db:seed --class=DatabaseSeeder --force
```

### 3. Create Storage Link
```bash
php artisan storage:link
```

### 4. Optimize for Production
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
Access: `GET /api/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Monitoring Setup
- **Vercel**: Built-in analytics and performance monitoring
- **Railway**: Built-in logs and metrics
- **Render**: Built-in logs and error tracking

### Log Monitoring
```bash
# View application logs
php artisan log:clear
tail -f storage/logs/laravel.log
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error
```bash
# Check logs
php artisan log:clear
tail -f storage/logs/laravel.log

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### 2. Database Connection Failed
- Check database credentials
- Verify database is running
- Check firewall settings
- Ensure database URL is correct

#### 3. Permission Issues
```bash
# Fix storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

#### 4. Memory Issues
```bash
# Increase PHP memory limit
php -d memory_limit=512M artisan optimize
```

### Debug Mode
Only enable debug mode in development:
```env
APP_DEBUG=true  # Only for development
```

### Performance Issues
1. Enable OPcache
2. Use Redis for caching
3. Implement queue system
4. Use CDN for static assets

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Runs Tests**: Ensures code quality
2. **Deploys to Vercel**: Frontend deployment
3. **Deploys to Railway**: Backend deployment
4. **Deploys to Render**: Alternative backend

### Manual Deployment
```bash
# Deploy to all platforms
git push origin main
```

### Skip Tests (Emergency)
```bash
git push origin main --no-verify
```

## 📱 Post-Deployment Checklist

### ✅ Security
- [ ] HTTPS enabled
- [ ] Debug mode disabled
- [ ] Environment variables secured
- [ ] Database credentials hidden
- [ ] API rate limiting configured

### ✅ Performance
- [ ] Caching enabled
- [ ] CDN configured
- [ ] Images optimized
- [ ] Database indexed
- [ ] Queue system running

### ✅ Monitoring
- [ ] Health checks passing
- [ ] Error tracking enabled
- [ ] Log rotation configured
- [ ] Backup strategy in place
- [ ] Uptime monitoring set

### ✅ Functionality
- [ ] All APIs responding
- [ ] Database connected
- [ ] File uploads working
- [ ] Email notifications sending
- [ ] User authentication working

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Review application logs
2. **Verify Environment**: Check all environment variables
3. **Test Locally**: Ensure code works locally
4. **Check Platform Status**: Verify platform uptime
5. **Review Documentation**: Consult platform-specific docs

### Platform Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

## 🎉 Congratulations!

Your Pawesome pet management system is now deployed! 🚀

### Next Steps
1. Monitor performance
2. Set up analytics
3. Configure backups
4. Plan scaling strategy
5. Gather user feedback

---

**Happy Deploying! 🐾**
