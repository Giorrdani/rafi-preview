param(
    [Parameter(Mandatory=$true)] [string]$ConfigFile,
    [ValidateSet('Backup','Check')] [string]$Mode = 'Backup'
)
$ErrorActionPreference = 'Stop'
$config = Get-Content -LiteralPath $ConfigFile -Raw -Encoding UTF8 | ConvertFrom-Json
if ($config.PSObject.Properties.Name -contains 'password') { throw 'Do not store passwords in backup JSON. Use RAFI_DB_PASSWORD or PGPASSFILE.' }
$python = if ($config.python) { [string]$config.python } else { 'python' }
Get-Command $python -ErrorAction Stop | Out-Null
$tool = Join-Path $PSScriptRoot 'tools/rafi_backup.py'
$arguments = @($tool, $Mode.ToLowerInvariant(), '--destination', [string]$config.destination)
if ($Mode -eq 'Backup') {
    foreach ($key in @('pg_bin','host','port','database','user','plans','app_port')) {
        if ($null -eq $config.$key) { throw "Missing backup setting: $key" }
        $arguments += @(('--' + $key.Replace('_','-')), ([string]$config.$key))
    }
} else {
    $age = if ($config.max_age_hours) { [string]$config.max_age_hours } else { '26' }
    $arguments += @('--max-age-hours', $age)
}
& $python @arguments
if ($LASTEXITCODE -ne 0) { throw 'Backup/check failed. Inspect journal.jsonl, status.json and the task output.' }
