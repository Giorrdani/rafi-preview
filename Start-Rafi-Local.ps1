$ErrorActionPreference='Stop'
$settings=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'data/rafi-local/runtime.json') -Raw | ConvertFrom-Json
if(-not(Test-Path -LiteralPath $settings.python)){throw 'Python runtime not found. See docs/WINDOWS-LOCAL-RUNTIME.md'}
& $settings.python (Join-Path $PSScriptRoot 'tools/local_runtime.py')
exit $LASTEXITCODE
