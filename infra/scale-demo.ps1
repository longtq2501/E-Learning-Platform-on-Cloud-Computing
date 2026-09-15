$composeFile = Join-Path $PSScriptRoot "docker-compose.yml"
$envFile = Join-Path $PSScriptRoot ".env"
$apiUrl = "http://localhost/api/health"

if (-not (Test-Path $envFile)) {
    Write-Error "Missing $envFile. Copy infra/.env.example to infra/.env and set JWT_SECRET."
    exit 1
}

$composeArgs = @("--env-file", $envFile, "-f", $composeFile)

docker compose @composeArgs up -d
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Requests through all backend instances:"
1..12 | ForEach-Object {
    $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
    "{0}: {1} ({2})" -f $_, $response.Headers["X-Instance-Id"], $response.StatusCode
}

Write-Host "Stopping backend-2..."
docker compose @composeArgs stop backend-2
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Requests after backend-2 stops:"
1..6 | ForEach-Object {
    $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing
    "{0}: {1} ({2})" -f $_, $response.Headers["X-Instance-Id"], $response.StatusCode
}