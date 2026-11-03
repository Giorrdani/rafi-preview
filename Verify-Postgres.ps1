param(
    [Parameter(Mandatory=$true)]
    [ValidatePattern('^jdbc:postgresql://127\.0\.0\.1:[0-9]{1,5}/rafi_postgres_check$')]
    [string]$Url,
    [string]$Maven = 'mvn.cmd'
)
$ErrorActionPreference = 'Stop'
Get-Command $Maven -ErrorAction Stop | Out-Null
$names = @('RAFI_RUN_POSTGRES_IT','RAFI_TEST_POSTGRES_URL','RAFI_TEST_POSTGRES_PASSWORD')
$previous = @{}
foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name,'Process') }
$entered = $null
Push-Location $PSScriptRoot
try {
    $env:RAFI_RUN_POSTGRES_IT = 'true'
    $env:RAFI_TEST_POSTGRES_URL = $Url
    if (-not $env:RAFI_TEST_POSTGRES_PASSWORD) {
        $entered = Read-Host 'Password for the isolated rafi_check test role' -AsSecureString
        $env:RAFI_TEST_POSTGRES_PASSWORD = [Net.NetworkCredential]::new('', $entered).Password
    }
    & $Maven '-Dtest=PostgresWorkflowIT' test
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL verification failed. See target/surefire-reports.' }
    Write-Host 'PostgreSQL verification passed. Working database was not selected.'
} finally {
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name,$previous[$name],'Process') }
    if ($entered) { $entered.Dispose() }
    Pop-Location
}
