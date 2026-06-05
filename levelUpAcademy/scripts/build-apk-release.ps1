# Gera APK release usando Java 21 (via gradle.properties).
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$android = Join-Path $root 'android'

& (Join-Path $PSScriptRoot 'use-java21.ps1') | Out-Null

Push-Location $android
try {
    .\gradlew.bat assembleRelease
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle falhou (exit code $LASTEXITCODE)."
    }
    $apk = Join-Path $android 'app\build\outputs\apk\release\app-release.apk'
    if (Test-Path $apk) {
        Write-Host ""
        Write-Host "APK gerado: $apk"
    }
} finally {
    Pop-Location
}
