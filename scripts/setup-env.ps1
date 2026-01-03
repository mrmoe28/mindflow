# PowerShell script to set up Supabase environment variables
# Usage: .\scripts\setup-env.ps1 -SupabaseUrl "https://xxx.supabase.co" -AnonKey "xxx" -ServiceKey "xxx" -DbUrl "postgresql://..."

param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$AnonKey,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceKey,
    
    [Parameter(Mandatory=$false)]
    [string]$DbUrl
)

$envFile = ".\.env"

# Read existing .env file if it exists
$envContent = ""
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
} else {
    # Create base content
    $envContent = @"
# JWT Secret for token generation
JWT_SECRET=lddJcPXHeFLYE1xWCgTmVjbHOkRVs/yem4CEN6BM0E4=

# Database Connection String
DATABASE_URL=

# Optional: API URL (defaults to /api)
VITE_API_URL=/api

"@
}

# Function to update or add environment variable
function Update-EnvVar {
    param([string]$name, [string]$value)
    
    $pattern = "$name=.*"
    if ($envContent -match $pattern) {
        $envContent = $envContent -replace $pattern, "$name=$value"
    } else {
        $envContent += "`n$name=$value"
    }
}

# Update Supabase variables
Update-EnvVar "VITE_SUPABASE_URL" $SupabaseUrl
Update-EnvVar "VITE_SUPABASE_ANON_KEY" $AnonKey
Update-EnvVar "SUPABASE_URL" $SupabaseUrl
Update-EnvVar "SUPABASE_ANON_KEY" $AnonKey
Update-EnvVar "SUPABASE_SERVICE_ROLE_KEY" $ServiceKey

# Update DATABASE_URL if provided
if ($DbUrl) {
    Update-EnvVar "DATABASE_URL" $DbUrl
}

# Write to .env file
Set-Content -Path $envFile -Value $envContent

Write-Host "✅ Environment variables updated in .env file" -ForegroundColor Green
Write-Host "`nRun 'npm run setup:check' to verify configuration" -ForegroundColor Cyan

