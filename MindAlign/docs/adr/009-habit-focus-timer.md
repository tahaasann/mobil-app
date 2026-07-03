# ADR 009: Habit focus timer (foreground-only)

## Status

Accepted — FAZ 18.5

## Context

Habit detail includes an optional focus timer so users can run a short block before marking a habit done. React Native timers tied to `setInterval` do not reliably continue when the app is backgrounded.

## Decision

- Default duration: **5 minutes** (`DEFAULT_FOCUS_SECONDS`).
- Timer runs **only while the screen is mounted and the app is in the foreground**.
- When the user navigates away or backgrounds the app, the interval is cleared by React unmount / effect cleanup; no background task or notification is scheduled.
- Completion is a **local UI state** only (no log entry, no streak change).
- Start resets the countdown; Stop resets to the full duration.

## Consequences

- Simple, predictable behavior without extra permissions.
- Users who need background timers can revisit this ADR and add notification-based completion later.
- Tests use Jest fake timers against pure helpers in `focus-timer.ts`.
