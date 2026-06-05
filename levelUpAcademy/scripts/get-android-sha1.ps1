# Imprime SHA-1 do keystore usado para assinar o APK (debug.keystore do projeto).
$keystore = Join-Path $PSScriptRoot "..\android\app\debug.keystore"
if (-not (Test-Path $keystore)) {
    Write-Error "Keystore nao encontrado: $keystore"
    exit 1
}

$output = keytool -list -v -keystore $keystore -alias androiddebugkey -storepass android -keypass android 2>&1 | Out-String
if ($output -match 'SHA1:\s*([0-9A-F:]+)') {
    $sha1 = $Matches[1]
    $sha1NoColons = ($sha1 -replace ':', '').ToLower()
    Write-Host ""
    Write-Host "Package name: com.lucas.levelupacademy"
    Write-Host "SHA-1 (Firebase Console): $sha1"
    Write-Host "SHA-1 (sem dois-pontos):   $sha1NoColons"
    Write-Host ""
    Write-Host "Adicione em: https://console.firebase.google.com/project/levelup-8f123/settings/general"
    Write-Host "Depois baixe o novo google-services.json e substitua android/app/google-services.json"
    Write-Host ""
} else {
    Write-Error "Nao foi possivel ler o SHA-1 do keystore."
    exit 1
}
