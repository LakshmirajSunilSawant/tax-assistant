# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "Loaded $key" -ForegroundColor Green
    }
}

Write-Host "`nStarting FastAPI backend...`n" -ForegroundColor Cyan

# Force gemini-pro model
$env:GEMINI_MODEL = "gemini-pro"

# Start the backend server using uvicorn directly
Write-Host "Starting backend server..." -ForegroundColor Green
uvicorn main:app --reload --port 8000
