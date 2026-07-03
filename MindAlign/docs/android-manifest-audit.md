# Android Manifest Audit (T-239)

## Production profile

- `expo-dev-client` yalnızca development/preview build'lerde kullanılmalı; production EAS profili `--profile production` ile dev client içermez.
- `blockedPermissions` (`app.config.ts`):
  - `SYSTEM_ALERT_WINDOW`
  - `READ_EXTERNAL_STORAGE`
  - `WRITE_EXTERNAL_STORAGE`

## Backup (T-238)

- `expo-build-properties` → `android.allowBackup: false`

## Verify before Play upload

```bash
# After prebuild / EAS build, inspect merged manifest:
# android/app/src/main/AndroidManifest.xml
```

Checklist:

- [ ] `android:allowBackup="false"`
- [ ] No `SYSTEM_ALERT_WINDOW`
- [ ] No legacy storage permissions unless justified
