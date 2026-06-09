param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$TargetConnectionString = $env:DATABASE_URL_RESTORE_TEST
)

if (-not (Test-Path $BackupFile)) {
  Write-Error "Arquivo de backup não encontrado: $BackupFile"
  exit 1
}

if (-not $TargetConnectionString) {
  Write-Error "DATABASE_URL_RESTORE_TEST não definido."
  exit 1
}

pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$TargetConnectionString" "$BackupFile"
if ($LASTEXITCODE -ne 0) {
  Write-Error "Falha no teste de restauração."
  exit $LASTEXITCODE
}

Write-Host "Restauração de teste concluída com sucesso usando: $BackupFile"
