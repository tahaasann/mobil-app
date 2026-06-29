# MindAlign

Expo SDK 56 habit-coaching app (hexagonal architecture, TDD, Firebase AI Logic, RevenueCat, AdMob).

## Requirements

- Node 20+
- pnpm 9+
- Expo dev client (native Firebase / notifications / purchases / ads)

## Setup

```bash
cd MindAlign
pnpm install
cp .env.example .env
# Add google-services.json and GoogleService-Info.plist locally (not committed)
pnpm expo prebuild --clean   # after native module changes
pnpm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Expo dev server |
| `pnpm android` / `pnpm ios` | Native run |
| `pnpm test` | Jest unit tests |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint + Prettier |
| `pnpm test:e2e` | Maestro flows |

## Production

Set `APP_ENV=production` and all production keys in EAS secrets (RevenueCat, AdMob, Firebase config files). Mock flags are blocked at startup when `APP_ENV=production`.

See [GUVENLIK_COZUM_REHBERI.md](./GUVENLIK_COZUM_REHBERI.md) for security checklist and launch blockers.
