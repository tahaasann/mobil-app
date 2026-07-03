# ADR 004: Plus Entitlement vs Kayıtlı Kullanıcı Sync

## Durum

Kabul edildi — FAZ 13 (paywall metin uyumu)

## Karar

| Özellik | Misafir | Kayıtlı (ücretsiz) | Plus |
|---|---|---|---|
| AI koç kotası | Haftalık ücretsiz limit | Haftalık ücretsiz limit | 60/sohbet haftalık |
| Bookmark/chat bulut sync | Hayır | **Evet** | **Evet** |
| Reklam ile bonus kota | Evet (dev/prod politikasına göre) | Evet | Hayır (reklam yok hedefi) |

Plus satış vaadi **yalnızca genişletilmiş AI kotası ve reklamsız deneyim** içerir. Bookmark sync, kayıtlı hesap avantajıdır; Plus’a özel değildir (ADR 002 ile uyumlu).

## Sonuçlar

- Paywall metinleri bookmark sync iddiasını kaldırır.
- `EnqueueSyncUseCase` kayıtlı kullanıcılar için sync’i sürdürür; Plus kontrolü eklenmez.
