param(
    [switch]$NoFrontend,
    [switch]$NoBackend,
    [int]$DelaySeconds = 2
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

$backendServices = @(
    "identity-service",
    "catalog-service",
    "room-service",
    "booking-service",
    "billing-service",
    "promotion-service",
    "content-service",
    "feedback-service",
    "report-service",
    "notification-service",
    "api-gateway"
)

$frontendApps = @(
    @{ Name = "customer-next"; Path = "next_learn"; Command = "npm run dev" },
    @{ Name = "admin-next"; Path = "hotel_admin"; Command = "npm run dev" }
)

function Start-DevWindow {
    param(
        [string]$Name,
        [string]$WorkingPath,
        [string]$Command
    )

    $resolvedPath = Join-Path $root $WorkingPath
    if (-not (Test-Path $resolvedPath)) {
        Write-Warning "Skip $Name because path does not exist: $resolvedPath"
        return
    }

    $title = "HotelContinental - $Name"
    $script = "Set-Location `"$resolvedPath`"; `$host.UI.RawUI.WindowTitle = `"$title`"; $Command"

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy", "Bypass",
        "-Command", $script
    )

    Write-Host "Started $Name" -ForegroundColor Green
}

if (-not $NoBackend) {
    foreach ($service in $backendServices) {
        Start-DevWindow `
            -Name $service `
            -WorkingPath "backend\$service" `
            -Command ".\mvnw.cmd spring-boot:run"

        Start-Sleep -Seconds $DelaySeconds
    }
}

if (-not $NoFrontend) {
    foreach ($app in $frontendApps) {
        Start-DevWindow `
            -Name $app.Name `
            -WorkingPath $app.Path `
            -Command $app.Command

        Start-Sleep -Seconds $DelaySeconds
    }
}

Write-Host ""
Write-Host "All requested dev processes were started." -ForegroundColor Cyan
Write-Host "Make sure MySQL, Redis, Kafka and any required infrastructure are already running." -ForegroundColor Yellow
