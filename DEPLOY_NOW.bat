@echo off
echo 🚀 PAWESOME DEPLOYMENT WIZARD
echo ================================
echo.
echo This wizard will guide you step by step to deploy your app!
echo.
pause

echo.
echo STEP 1: CREATING ACCOUNTS
echo ========================
echo.
echo Please open these websites and create accounts:
echo.
echo 1. GitHub: https://github.com/signup
echo 2. Railway: https://railway.app (click "Sign up with GitHub")
echo 3. Vercel: https://vercel.com (click "Sign up with GitHub")
echo.
echo After creating all accounts, press any key to continue...
pause

echo.
echo STEP 2: INSTALLING TOOLS
echo ========================
echo.
echo Installing Git, Node.js, and deployment tools...
echo.

:: Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Git is not installed. Please download and install from:
    echo https://git-scm.com/download/win
    echo.
    echo After installing Git, press any key to continue...
    pause
) else (
    echo ✅ Git is already installed
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please download and install from:
    echo https://nodejs.org/en/download/
    echo.
    echo After installing Node.js, press any key to continue...
    pause
) else (
    echo ✅ Node.js is already installed
)

:: Install Railway CLI
echo Installing Railway CLI...
npm install -g @railway/cli

:: Install Vercel CLI
echo Installing Vercel CLI...
npm install -g vercel

echo ✅ All tools installed!
echo.
pause

echo.
echo STEP 3: SETTING UP GITHUB
echo ==========================
echo.
echo First, let's create a GitHub repository:
echo.
echo 1. Go to https://github.com
echo 2. Click "New" button
echo 3. Repository name: pawesome
echo 4. Keep it Private
echo 5. Click "Create repository"
echo.
echo After creating the repository, press any key to continue...
pause

echo.
echo Now let's upload your code to GitHub...
cd /d "c:\Users\ACER\Pawesome_frontend"

echo Initializing Git repository...
git init
git add .
git commit -m "Initial commit: Pawesome pet management system"

echo.
echo Please enter your GitHub username:
set /p github_username="Username: "

echo Connecting to GitHub...
git remote add origin https://github.com/%github_username%/pawesome.git
git branch -M main
git push -u origin main

echo ✅ Code uploaded to GitHub!
echo.
pause

echo.
echo STEP 4: DEPLOYING BACKEND TO RAILWAY
echo ====================================
echo.
cd backend

echo Please login to Railway...
railway login

echo.
echo Initializing Railway project...
railway init

echo.
echo Deploying to Railway (this will take 2-3 minutes)...
railway up

echo.
echo ✅ Backend deployed!
echo.
echo Opening your backend in browser...
railway open

echo.
echo Please check if your backend is working:
echo - Add /api/health to the URL
echo - You should see: {"status":"ok",...}
echo.
echo Press any key to continue...
pause

echo.
echo STEP 5: DEPLOYING FRONTEND TO VERCEL
echo =====================================
echo.
cd ..\frontend

echo Please login to Vercel...
vercel login

echo.
echo Deploying to Vercel (this will take 1-2 minutes)...
vercel --prod

echo.
echo ✅ Frontend deployed!
echo.
pause

echo.
echo STEP 6: CONNECTING FRONTEND TO BACKEND
echo =======================================
echo.
echo Getting your backend URL...
cd ..\backend
for /f "tokens=*" %%i in ('railway open 2^>nul') do set backend_url=%%i

echo Your backend URL is: %backend_url%
echo.
echo Now we need to configure the frontend to connect to your backend...
cd ..\frontend

echo Setting up API connection...
set /p api_url="Enter your backend URL with /api at the end: "

vercel env add REACT_APP_API_URL production

echo.
echo Redeploying frontend with new settings...
vercel --prod

echo ✅ Frontend connected to backend!
echo.
pause

echo.
echo STEP 7: FINAL TESTING
echo =====================
echo.
echo Your Pawesome system is now LIVE! 🎉
echo.
echo Your URLs:
echo - Frontend: Check your Vercel deployment email
echo - Backend: %backend_url%
echo - GitHub: https://github.com/%github_username%/pawesome
echo.
echo Test your app:
echo 1. Open your frontend URL
echo 2. Try to register a new user
echo 3. Try to login
echo 4. Check if dashboard works
echo.
echo ================================
echo 🎉 DEPLOYMENT COMPLETE! 🎉
echo ================================
echo.
echo Your Pawesome pet management system is now live on the internet!
echo.
echo For help with issues:
echo - Railway: https://docs.railway.app
echo - Vercel: https://vercel.com/docs
echo - GitHub: https://docs.github.com
echo.
pause
