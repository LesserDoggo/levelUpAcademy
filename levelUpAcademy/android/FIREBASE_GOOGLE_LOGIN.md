# Google Sign-In Android — SHA-1

O APK deste projeto é assinado com `android/app/debug.keystore`.

## Valores corretos

| Campo | Valor |
|-------|--------|
| Package name | `com.lucas.levelupacademy` |
| SHA-1 (keystore do projeto) | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` |

## SHA-1 cadastrados hoje no Firebase (não batem com este APK)

- `49:2B:DE:E8:76:A0:88:D8:2B:21:2F:B2:DE:8B:3A:DE:C2:4A:4D:5B`
- `04:C0:5A:7F:7A:E4:D4:8D:A2:F5:53:1C:75:8D:23:A1:D5:08:F4:E4`

Por isso o login com Google falha no celular.

## Corrigir (uma vez)

1. Abra [Firebase → Configurações do projeto](https://console.firebase.google.com/project/levelup-8f123/settings/general).
2. App Android `com.lucas.levelupacademy` → **Adicionar impressão digital**.
3. Cole: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
4. Baixe o novo `google-services.json` e substitua `android/app/google-services.json`.
5. Gere o APK de novo: `npm run build:apk`

Para ver o SHA-1 a qualquer momento: `npm run sha1:android`
