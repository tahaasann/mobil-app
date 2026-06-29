# RevenueCat setup (T-127)

Configure products in RevenueCat and the app stores before enabling live purchases.

## Entitlement

- Identifier: `plus`
- Display name: MindAlign Plus

## Store products

| Product ID               | Type                   | Notes                        |
| ------------------------ | ---------------------- | ---------------------------- |
| `mindalign_plus_monthly` | Auto-renewable monthly | 7-day free trial recommended |
| `mindalign_plus_annual`  | Auto-renewable annual  | Best value tier              |

## RevenueCat offering

1. Create an Offering (e.g. `default`).
2. Attach monthly and annual packages.
3. Map both products to the `plus` entitlement.
4. Copy the **public SDK key** into `.env`:

```env
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxx_or_goog_xxx
```

For local development without store products, keep mocks enabled:

```env
EXPO_PUBLIC_SUBSCRIPTION_MOCK=true
```

## Verification

- Offerings appear in RevenueCat dashboard.
- Dev build initializes Purchases (or mock adapter when `EXPO_PUBLIC_SUBSCRIPTION_MOCK=true`).
- Paywall shows monthly/annual prices from RevenueCat offerings.
