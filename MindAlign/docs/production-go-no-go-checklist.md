# ADR 006 companion — production launch gate (FAZ 17 / T-268)

**Last updated:** FAZ 17 completion  
**Owner:** Release captain  
**Next phase:** FAZ 8 store assets (T-154–T-166)

## GO criteria (all must be true)

| Area | Gate | Status |
|---|---|---|
| Environment | `APP_ENV=production` with no mock flags (`assertProductionConfig`) | ☐ |
| RevenueCat | Platform RC keys in EAS secrets | ☐ |
| AdMob | Platform App ID + rewarded unit IDs in EAS secrets (adapter still disabled) | ☐ |
| Firebase | `google-services.json` / `GoogleService-Info.plist` in EAS | ☐ |
| App Check | No debug tokens in production build | ☐ |
| Crisis safety | 112 + ALO 182 resources; output guardrail active | ☐ |
| Paywall legal | Privacy + Terms URLs reachable from paywall | ☐ |
| i18n | EN + TR only; boot hydrate from SQLite | ☐ |
| Tests | `pnpm test:ci` ≥ 55% coverage threshold | ☐ |
| Lint / typecheck | `pnpm lint` 0 errors; typecheck clean on app src | ☐ |
| E2E | `.maestro/smoke_four_tabs.yaml` green on device | ☐ |
| CI | Main branch: quality + Maestro validate + audit | ☐ |

## NO-GO blockers (any = stop)

- Any `EXPO_PUBLIC_*_MOCK=true` in production profile
- Missing RevenueCat or AdMob production keys
- Crisis flow shows non-approved hotlines
- Paywall without restore / legal links
- Coverage regression below 55% global threshold
- Unhandled Crashlytics spike on preview internal track

## FAZ 8 handoff (T-154–T-166)

1. App icon + splash all densities (T-154)
2. Store listing EN/TR screenshots + descriptions
3. Play internal → closed → production rollout
4. Privacy policy URL live on domain
5. Post-launch: re-enable AdMob native package per `docs/admob-restore-checklist.md`

## Sign-off

| Role | Name | Date | GO / NO-GO |
|---|---|---|---|
| Engineering | | | |
| QA | | | |
| Product | | | |
