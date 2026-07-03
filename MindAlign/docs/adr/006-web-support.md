# ADR 006: Web Desteği (react-native-web)

## Durum

Kabul edildi — Android-first MVP (FAZ 16)

## Bağlam

- Expo şablonu `react-dom` ve `react-native-web` ile birlikte gelir; `pnpm web` komutu mevcuttur.
- Uygulama Firebase Native SDK, RevenueCat, SQLite ve push bildirimleri kullanır — bunların çoğu web'de ya desteklenmez ya da mock gerektirir.
- Store lansmanı **Android (ve sonrasında iOS)** hedefliyor; web için ayrı bir ürün yolu yok.

## Karar

**Web bağımlılıkları repoda kalır; web lansmanı MVP kapsamı dışındadır.**

| Konu | Karar |
|---|---|
| `react-dom` / `react-native-web` | Tutulur (Expo toolchain uyumu) |
| `pnpm web` | Geliştirici smoke test için kullanılabilir; resmi destek yok |
| Firebase / RC / SQLite / bildirim | Web'de production-ready sayılmaz |
| Store çıkışı | Yalnızca native (Android öncelik) |

## Sonuçlar

- Expo güncellemeleri ve `expo-doctor` uyumluluğu korunur.
- Web için ayrı adapter katmanı veya feature flag yükü alınmaz (Phase 2).
- CI'da web build zorunlu değildir (FAZ 17 native odaklı kalır).

## Phase 2 (opsiyonel)

- PWA veya marketing landing ayrı repo ile.
- Auth + read-only dashboard için sınırlı web client ve mock port'lar.
