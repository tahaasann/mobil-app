# Store Subscription Metadata Checklist (T-224)

Complete in Google Play Console / App Store Connect before release. Wording must match in-app paywall (`paywall.*` i18n keys).

## Product names

- **MindAlign Plus — Monthly**
- **MindAlign Plus — Annual**

## Short description (Play)

Weekly AI coach chats (up to 60), ad-free coach experience. Auto-renews until canceled.

## Trial (if configured in RevenueCat / Play)

- State free trial length exactly as in store (e.g. "7-day free trial").
- In-app label uses `paywall.startTrial` only when intro price is **$0** (see `subscription-package-mapper.ts`).

## Auto-renewal disclosure

Match `paywall.autoRenewal` (EN/TR).

## Legal URLs

| Field | URL env var |
|---|---|
| Privacy Policy | `EXPO_PUBLIC_PRIVACY_POLICY_URL` |
| Terms of Service | `EXPO_PUBLIC_TERMS_URL` |

Source drafts: `docs/privacy-policy.md`, `docs/terms-of-service.md`.

## Restore purchases

Available on paywall (`paywall.restore`).

## Manual sign-off

- [ ] Play subscription benefits text matches ADR 004 (no bookmark-sync-as-Plus claim)
- [ ] Trial/intro pricing matches RevenueCat offerings
- [ ] Legal URLs live and open from paywall
