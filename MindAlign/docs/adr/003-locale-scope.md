# ADR 003: Lansman Dil Kapsamı (EN + TR)

## Durum

Kabul edildi — Android-first MVP (FAZ 14)

## Bağlam

- `SUPPORTED_LOCALES` içinde `ar`, `ja`, `fr` iskelet çevirileri vardı (121 vs 51 anahtar uyumsuzluğu).
- Profil ekranında yalnızca EN/TR seçilebiliyordu; cihaz dili Arapça/Japonca/Fransızca ise yarım locale yüklenebiliyordu.
- Store lansmanı Türkiye + global İngilizce pazar hedefliyor.

## Karar

**Lansman kapsamı: yalnızca `en` ve `tr`.**

| Konu | Karar |
|---|---|
| Seçilebilir diller | `en`, `tr` |
| `ar` / `ja` / `fr` JSON dosyaları | Repoda tutulmaz (Phase 2 backlog) |
| Cihaz dili eşleşmezse | `en` fallback |
| RTL | Phase 2 (Arapça eklenince) |
| AI coach cevap dili | `settings.language` → prompt `responseLanguage` |

## Sonuçlar

- Production'da yarım çeviri riski kapanır.
- i18n anahtar sayısı tek kaynakta (`en.json` / `tr.json`) tutulur.
- Maestro dil kalıcılığı testi EN/TR ile sınırlıdır.

## Phase 2 (opsiyonel)

- Arapça (RTL), Japonca, Fransızca tam çeviri + store metadata.
