param([switch]$UseH2)
if(-not $UseH2 -and (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'data/rafi-local/runtime.json'))){
 & (Join-Path $PSScriptRoot 'Start-Rafi-Local.ps1')
 exit $LASTEXITCODE
}
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$jar=Join-Path $PSScriptRoot 'dist/rafi.jar'
if(-not(Test-Path -LiteralPath $jar)){throw 'Не найден dist/rafi.jar'}
$javaCandidates=@()
if($env:JAVA_HOME){$javaCandidates+=Join-Path $env:JAVA_HOME 'bin/java.exe'}
$javaCandidates+='C:/Program Files/Java/jdk-21.0.12.1/bin/java.exe'
$command=Get-Command java -ErrorAction SilentlyContinue
if($command){$javaCandidates+=$command.Source}
$java=$javaCandidates | Where-Object {Test-Path -LiteralPath $_} | Select-Object -First 1
if(-not $java){throw 'Установите Java 21 или укажите JAVA_HOME'}
if(-not(Test-Path -LiteralPath (Join-Path $PSScriptRoot 'data/.rafi-initialized'))){
 Write-Host 'Первый запуск или повтор после ошибки: задайте пароль developer. Если аккаунт уже существует, пароль не изменится.'
 foreach($entry in ,@('RAFI_DEVELOPER_PASSWORD','Разработчик')){
  if(-not [Environment]::GetEnvironmentVariable($entry[0],'Process')){
   $secret=Read-Host ($entry[1]+' — пароль, минимум 8 символов') -AsSecureString
   $plain=[System.Net.NetworkCredential]::new('',$secret).Password
   if($plain.Length -lt 8 -or [Text.Encoding]::UTF8.GetByteCount($plain) -gt 72){throw 'Пароль: минимум 8 символов и максимум 72 байта UTF-8'}
   [Environment]::SetEnvironmentVariable($entry[0],$plain,'Process')
   $plain=$null
  }
 }
}
Write-Host 'Rafi 2.1.0-preview — откройте http://localhost:8081. Остановка: Ctrl+C. При первом запуске войдите как developer, создайте клуб и сотрудников.'
try { & $java -jar $jar '--server.address=127.0.0.1';if($LASTEXITCODE -ne 0){throw 'Приложение завершилось с ошибкой. Сохраните журнал из этого окна.'} }
finally {Remove-Item Env:RAFI_DEVELOPER_PASSWORD -ErrorAction SilentlyContinue;Remove-Item Env:RAFI_ADMIN_PASSWORD -ErrorAction SilentlyContinue}
