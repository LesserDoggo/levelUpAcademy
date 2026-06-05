# Configura Java 21 para builds Android (usuario + sessao atual).
$javaHome = 'C:\Program Files\Java\jdk-21.0.10'
$javaBin = Join-Path $javaHome 'bin'

if (-not (Test-Path $javaHome)) {
    Write-Error "JDK 21 nao encontrado em: $javaHome"
    exit 1
}

$env:JAVA_HOME = $javaHome
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*$javaBin*") {
    [Environment]::SetEnvironmentVariable('Path', "$javaBin;$userPath", 'User')
}
[Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')

# Para a sessão atual, apenas garanta que o Java 21 está primeiro no PATH.
# Não filtre/reconstrua o PATH: isso pode remover outras ferramentas (ex.: node) e quebrar o Gradle.
if (-not ($env:Path -split ';' | Where-Object { $_ } | Select-Object -First 1) -eq $javaBin) {
    $env:Path = "$javaBin;$env:Path"
}

Write-Host "JAVA_HOME = $javaHome (persistido no usuario)"
java -version
