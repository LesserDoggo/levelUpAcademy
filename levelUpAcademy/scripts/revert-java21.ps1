# Reverte JAVA_HOME para Java 25 (padrao anterior nesta maquina).
$javaHome = 'C:\Program Files\Java\jdk-25.0.2'
$javaBin = Join-Path $javaHome 'bin'
$java21Bin = 'C:\Program Files\Java\jdk-21.0.10\bin'

if (-not (Test-Path $javaHome)) {
    Write-Warning "JDK 25 nao encontrado em $javaHome. Removendo apenas JAVA_HOME do usuario."
    [Environment]::SetEnvironmentVariable('JAVA_HOME', $null, 'User')
} else {
    [Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, 'User')
    $env:JAVA_HOME = $javaHome
}

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$segments = $userPath -split ';' | Where-Object { $_ -and ($_ -ne $java21Bin) }
if (Test-Path $javaHome) {
    if ($segments -notcontains $javaBin) {
        $segments = @($javaBin) + $segments
    }
}
[Environment]::SetEnvironmentVariable('Path', ($segments -join ';'), 'User')

Write-Host "JAVA_HOME revertido. Abra um novo terminal e rode: java -version"
