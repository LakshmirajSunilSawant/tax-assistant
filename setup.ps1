# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend dependencies installed!" -ForegroundColor Green

# Setup backend
Write-Host "`n🐍 Setting up Python backend..." -ForegroundColor Cyan
cd backend

# Check if Python is installed
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "❌ Python not found! Please install Python 3.10+ first." -ForegroundColor Red
    exit 1
}

Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend setup complete!" -ForegroundColor Green

cd ..

# Check for environment file
Write-Host "`n🔧 Checking environment configuration..." -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "⚠️  Please edit .env.local with your API keys before running the app!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host "`n✨ Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Edit .env.local with your API keys (Clerk, Gemini, Supabase)" -ForegroundColor White
Write-Host "2. Run setup for Supabase (see SETUP.md)" -ForegroundColor White  
Write-Host "3. Start the application:" -ForegroundColor White
Write-Host "   Frontend: npm run dev" -ForegroundColor Cyan
Write-Host "   Backend:  cd backend && python main.py" -ForegroundColor Cyan
Write-Host "`n📖 See SETUP.md for detailed instructions" -ForegroundColor Yellow
