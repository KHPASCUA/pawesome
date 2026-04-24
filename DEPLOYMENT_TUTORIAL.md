# 🚀 Pawesome Deployment Tutorial - Step by Step

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: GitHub Setup](#step-1-github-setup)
- [Step 2: Railway Deployment (Recommended)](#step-2-railway-deployment-recommended)
- [Step 3: Vercel Deployment (Frontend)](#step-3-vercel-deployment-frontend)
- [Step 4: Environment Configuration](#step-4-environment-configuration)
- [Step 5: Testing & Verification](#step-5-testing--verification)
- [Step 6: Custom Domain Setup](#step-6-custom-domain-setup)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you start, make sure you have:

### **Required Accounts:**
- [x] **GitHub Account** - For version control and CI/CD
- [x] **Railway Account** - For backend deployment (recommended)
- [x] **Vercel Account** - For frontend deployment (optional)
- [x] **Domain Name** - Custom domain (optional)

### **Required Tools:**
- [x] **Git** - For version control
- [x] **Node.js** - For frontend build
- [x] **PHP 8.2+** - For Laravel backend
- [x] **Composer** - For PHP dependencies

### **System Requirements:**
- [x] **Windows/Mac/Linux** - Any modern OS
- [x] **Internet Connection** - For deployment
- [x] **Code Editor** - VS Code recommended

---

## 📁 Step 1: GitHub Setup

### **1.1 Initialize Git Repository**
```bash
# Navigate to your project directory
cd c:\Users\ACER\Pawesome_frontend

# Initialize git repository
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Pawesome pet management system"
```

### **1.2 Create GitHub Repository**
1. Go to [GitHub](https://github.com)
2. Click **"New repository"**
3. Fill in details:
   - **Repository name**: `pawesome`
   - **Description**: `Pet management system`
   - **Visibility**: Private (recommended)
   - **Add README**: Uncheck (we have one)
4. Click **"Create repository"**

### **1.3 Connect Local Repository to GitHub**
```bash
# Add remote repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/pawesome.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### **1.4 Verify GitHub Setup**
- Go to your GitHub repository
- You should see all your files
- Verify the repository is connected

---

## 🚂 Step 2: Railway Deployment (Recommended)

Railway is perfect for Laravel applications with built-in database and Redis.

### **2.1 Install Railway CLI**
```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### **2.2 Login to Railway**
```bash
# Login to Railway
railway login

# This will open your browser for authentication
```

### **2.3 Initialize Railway Project**
```bash
# Navigate to backend directory
cd c:\Users\ACER\Pawesome_frontend\backend

# Initialize Railway project
railway init

# Choose "New Project" when prompted
# Give it a name like "pawesome-backend"
```

### **2.4 Configure Railway Services**
The `railway.toml` file is already configured for you:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "php artisan serve --host=0.0.0.0 --port=$PORT"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[services]]
name = "app"
source = "."
[services.environment]
APP_ENV = "production"
APP_DEBUG = "false"
APP_KEY = "${{APP_KEY}}"
APP_URL = "${{PUBLIC_URL}}"
DB_CONNECTION = "mysql"
DB_HOST = "${{RAILWAY_MYSQLHOST}}"
DB_PORT = "${{RAILWAY_MYSQLPORT}}"
DB_DATABASE = "${{RAILWAY_MYSQLDATABASE}}"
DB_USERNAME = "${{RAILWAY_MYSQLUSER}}"
DB_PASSWORD = "${{RAILWAY_MYSQLPASSWORD}}"
CACHE_DRIVER = "redis"
QUEUE_CONNECTION = "redis"
REDIS_HOST = "${{RAILWAY_REDIS_HOST}}"
REDIS_PASSWORD = "${{RAILWAY_REDIS_PASSWORD}}"
REDIS_PORT = "${{RAILWAY_REDIS_PORT}}"

[services.build]
buildCommand = "composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan optimize"

[[services]]
name = "mysql"
source = "railway/mysql:8.0"

[[services]]
name = "redis"
source = "railway/redis:7"
```

### **2.5 Deploy to Railway**
```bash
# Deploy your application
railway up

# This will:
# 1. Upload your code
# 2. Build the application
# 3. Set up MySQL database
# 4. Set up Redis cache
# 5. Deploy the application
```

### **2.6 Monitor Deployment**
```bash
# View deployment logs
railway logs

# Open your application in browser
railway open
```

### **2.7 Run Database Migrations**
```bash
# Get your Railway URL
railway open

# Add /migrate-run to the URL
# Example: https://pawesome-production.up.railway.app/migrate-run

# Or run via Railway shell
railway shell
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force
```

### **2.8 Verify Railway Deployment**
- Check if your application loads
- Test the health endpoint: `https://your-url.railway.app/api/health`
- Verify database connection

---

## 🟣 Step 3: Vercel Deployment (Frontend)

Vercel is excellent for React frontend applications.

### **3.1 Install Vercel CLI**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version
```

### **3.2 Login to Vercel**
```bash
# Navigate to frontend directory
cd c:\Users\ACER\Pawesome_frontend\frontend

# Login to Vercel
vercel login

# This will open your browser for authentication
```

### **3.3 Configure Vercel Project**
The `vercel.json` file is already configured:

```json
{
  "version": 2,
  "name": "pawesome-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api_url"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "build"
}
```

### **3.4 Deploy to Vercel**
```bash
# Deploy to Vercel
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your username
# - Link to existing project? No
# - Project name: pawesome-frontend
# - Directory: . (current)
# - Override settings? No
```

### **3.5 Configure Environment Variables**
```bash
# Set API URL to point to your Railway backend
vercel env add REACT_APP_API_URL production

# Enter your Railway URL:
# https://pawesome-production.up.railway.app/api

# Redeploy to apply changes
vercel --prod
```

### **3.6 Verify Vercel Deployment**
- Visit your Vercel URL
- Check if the frontend loads
- Test API connectivity
- Verify all pages work

---

## ⚙️ Step 4: Environment Configuration

### **4.1 Generate Application Key**
```bash
# Generate new APP_KEY for production
php artisan key:generate --show

# Copy the key and add it to Railway environment variables
```

### **4.2 Configure Railway Environment Variables**
1. Go to your Railway project
2. Click on your app service
3. Go to **"Variables"** tab
4. Add these variables:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:your-generated-key-here
APP_URL=https://your-app-url.railway.app

DB_CONNECTION=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_DATABASE=your-database-name
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# Email configuration (optional)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
```

### **4.3 Configure Frontend Environment**
```bash
# In frontend directory
cd c:\Users\ACER\Pawesome_frontend\frontend

# Create .env.production file
echo "REACT_APP_API_URL=https://your-railway-url.railway.app/api" > .env.production

# Redeploy Vercel
vercel --prod
```

---

## 🧪 Step 5: Testing & Verification

### **5.1 Health Check Tests**
```bash
# Test backend health
curl https://your-railway-url.railway.app/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z","version":"1.0.0","environment":"production"}
```

### **5.2 Database Connection Test**
```bash
# Access Railway shell
railway shell

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo() ? "DB OK" : "DB FAILED"
```

### **5.3 Frontend-Backend Integration**
1. Open your Vercel frontend URL
2. Try to login with test credentials
3. Test dashboard functionality
4. Verify API calls work

### **5.4 Full System Test**
```bash
# Test user registration
# Test login
# Test dashboard access
# Test API endpoints
# Test database operations
```

---

## 🌐 Step 6: Custom Domain Setup

### **6.1 Configure Custom Domain on Railway**
1. Go to Railway project
2. Click **"Settings"**
3. Click **"Domains"**
4. Add your custom domain
5. Configure DNS records as instructed

### **6.2 Configure Custom Domain on Vercel**
1. Go to Vercel dashboard
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Configure DNS records as instructed

### **6.3 Update Environment Variables**
```bash
# Update APP_URL in Railway
vercel env add REACT_APP_API_URL production

# Use your custom domain
# https://yourdomain.com/api
```

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **Issue 1: Build Fails on Railway**
```bash
# Check build logs
railway logs

# Common solutions:
# - Check composer.json for correct dependencies
# - Verify PHP version compatibility
# - Check for syntax errors in PHP files
```

#### **Issue 2: Database Connection Failed**
```bash
# Check database credentials
railway shell
php artisan tinker
>>> DB::connection()->getPdo()

# Common solutions:
# - Verify database variables are correct
# - Check if database is running
# - Ensure migrations are run
```

#### **Issue 3: Frontend Can't Connect to Backend**
```bash
# Check API URL in frontend
echo $REACT_APP_API_URL

# Common solutions:
# - Verify REACT_APP_API_URL is correct
# - Check CORS settings
# - Ensure backend is running
```

#### **Issue 4: 500 Internal Server Error**
```bash
# Check Laravel logs
railway shell
tail -f storage/logs/laravel.log

# Common solutions:
# - Check .env configuration
# - Verify file permissions
# - Check for PHP errors
```

#### **Issue 5: Assets Not Loading**
```bash
# Clear and rebuild frontend cache
cd frontend
rm -rf build node_modules
npm install
npm run build
vercel --prod
```

### **Getting Help**
- **Railway Documentation**: https://docs.railway.app
- **Vercel Documentation**: https://vercel.com/docs
- **Laravel Documentation**: https://laravel.com/docs
- **GitHub Issues**: Create issue in your repository

---

## 📋 Deployment Checklist

### **Pre-Deployment:**
- [ ] GitHub repository created and pushed
- [ ] Railway account created and CLI installed
- [ ] Vercel account created and CLI installed
- [ ] Environment variables identified
- [ ] Custom domain (if using) ready

### **Deployment:**
- [ ] Railway backend deployed and running
- [ ] Database migrations executed
- [ ] Vercel frontend deployed and running
- [ ] Environment variables configured
- [ ] API connectivity tested

### **Post-Deployment:**
- [ ] Health checks passing
- [ ] User registration working
- [ ] Login functionality working
- [ ] Dashboard loading correctly
- [ ] All API endpoints responding
- [ ] Custom domain configured (if applicable)

### **Monitoring:**
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up backup strategy
- [ ] Document deployment process

---

## 🎉 Congratulations!

Your Pawesome pet management system is now live! 🚀

### **What You Have:**
- **Backend API**: Running on Railway with MySQL and Redis
- **Frontend App**: Running on Vercel with custom domain
- **Database**: Fully configured and migrated
- **CI/CD**: Ready for future updates

### **Next Steps:**
1. **Monitor Performance**: Set up monitoring tools
2. **Configure Backups**: Enable automatic backups
3. **Add SSL**: Ensure HTTPS is enabled
4. **Scale Resources**: Upgrade as needed
5. **Gather Feedback**: Collect user feedback

### **Maintenance:**
- **Regular Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates
- **Performance Monitoring**: Monitor system performance
- **Backup Testing**: Test backup restoration

---

**Happy Deploying! 🐾**
