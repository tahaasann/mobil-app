# ADR 010: Habit done celebration feedback

## Status

Accepted — FAZ 18.6

## Context

Marking a habit done should feel rewarding. Options included sound effects, full-screen confetti libraries, and haptic feedback.

## Decision

- **Visual:** Short in-card overlay (`HabitDoneCelebration`) with Reanimated pulse/glow and lightweight confetti particles (~1.8s).
- **Haptic:** `expo-haptics` success notification on native; skipped on web.
- **Copy:** Streak-aware i18n buckets — first day, building (2–6), milestone (7–29), legend (30+).
- **Accessibility:** `accessibilityLiveRegion="polite"` announces message; confetti/glow disabled when Reduce Motion is on (text + haptic only).
- **Sound:** Not implemented in v1; avoids silent-mode surprises and extra asset licensing.

## Consequences

- No audio permission or asset pipeline needed.
- Celebration streak uses optimistic `streak + 1` when today was not yet logged, so copy matches the user's intent immediately.
- Future sound can be added behind a settings toggle without changing the overlay API.
