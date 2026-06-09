param(
  [string]$OutputDir = "backups",
  [string]$ConnectionString = $env:DATABASE_URL
)

if (-not $ConnectionString) {
  Write-Error "DATABASE_URL não definido."
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$filePath = Join-Path $OutputDir "popoio-$timestamp.dump"

pg_dump --format=custom --no-owner --no-privileges --file "$filePath" "$ConnectionString"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Falha ao criar backup."
  exit $LASTEXITCODE
}

Write-Host "Backup criado em: $filePath"
