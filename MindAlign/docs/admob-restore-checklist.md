# AdMob Restore Checklist (T-266)

AdMob native integration is **disabled** (`DisabledAdsAdapter`) until Kotlin/build issues are resolved. Production guard **already requires** AdMob env keys so EAS secrets are ready before re-enable.

## Before merging AdMob PR

- [ ] Resolve Kotlin metadata mismatch (see `admob-build.log`; bump `kotlinVersion` in `expo-build-properties` if needed)
- [ ] Re-add `react-native-google-mobile-ads` to `package.json`
- [ ] Restore `admob-rewarded.adapter.ts` (T-137) and wire in `create-ads-port.ts`
- [ ] Re-enable plugin block in `app.config.ts` (commented section)
- [ ] Set EAS secrets:
  - `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID`
  - `EXPO_PUBLIC_ADMOB_APP_ID_IOS`
  - `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID`
  - `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS`
- [ ] Run `pnpm validate:production` — guard tests must pass with keys
- [ ] Run `.maestro/quota_upgrade_or_ad.yaml` on device with `EXPO_PUBLIC_ADS_MOCK=false`
- [ ] Verify UMP consent + rewarded grant increments bonus quota

## Guard coverage

`production-guard.ts` validates all four `PRODUCTION_ADMOB_KEYS` when `APP_ENV=production`. Tests: `production-guard.test.ts`, `production-env-validation.test.ts`.
