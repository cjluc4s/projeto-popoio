param(
  [string]$OutputDir = "backups",
  [switch]$SkipRestoreTest
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Iniciando rotina mensal de backup..."

& (Join-Path $scriptDir "backup-db.ps1") -OutputDir $OutputDir

$latestBackup = Get-ChildItem -Path $OutputDir -Filter "popoio-*.dump" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latestBackup) {
  Write-Error "Backup não encontrado no diretório '$OutputDir' após execução."
  exit 1
}

if ($SkipRestoreTest) {
  Write-Host "Rotina concluída sem teste de restauração (SkipRestoreTest)."
  Write-Host "Arquivo gerado: $($latestBackup.FullName)"
  exit 0
}

if (-not $env:DATABASE_URL_RESTORE_TEST) {
  Write-Warning "DATABASE_URL_RESTORE_TEST não definido. Backup criado sem teste de restauração."
  Write-Host "Arquivo gerado: $($latestBackup.FullName)"
  exit 0
}

Write-Host "Executando teste de restauração no banco de homologação..."
& (Join-Path $scriptDir "restore-backup-test.ps1") -BackupFile $latestBackup.FullName

Write-Host "Rotina mensal concluída com sucesso."