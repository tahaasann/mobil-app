# ADR 002: Sync ve Oturum Veri Stratejisi

## Durum

Kabul edildi — Android-first MVP (FAZ 11)

## Bağlam

MindAlign hem misafir (Firebase Anonymous) hem kayıtlı kullanıcı destekliyor. Önceki davranış:

- Çıkış yapınca `clearSessionData()` ile **tüm habit/streak verisi siliniyordu** (P0 #3)
- “Verileri sil” yalnızca local SQLite temizliyordu; Firestore/Auth dokunulmuyordu (P0 #4)
- Bookmark/chat sync yalnızca login anında çalışıyordu; oturum içi değişiklikler kaybolabiliyordu

## Karar: Hibrit Model (B-lite)

| Veri | Misafir | Kayıtlı kullanıcı |
|---|---|---|
| Habits, streaks, profil | **Local-only** (cihaz) | **Local-only** (MVP) |
| Bookmarks, chat messages | Local-only | **Firestore sync** (outbox + login merge) |
| App settings (dil/tema/onboarding) | Local | Local |

### Oturum kuralları

1. **Çıkış (sign out):** Local habit/streak **silinmez**. Bildirimler iptal, sync outbox flush (kayıtlı), auth meta temizlenir.
2. **Hesap değişimi:** Farklı `userId` ile giriş → local session tabloları temizlenir → yeni kullanıcı verisi sync edilir.
3. **Misafir:** Firestore sync/outbox **devre dışı**.
4. **Verileri sil:** Local wipe + Firestore kullanıcı koleksiyonları sil + (kayıtlıysa) Firebase Auth hesabı sil.

### SQLite kullanıcı kapsamı (T-201)

MVP’de tablolara `userId` kolonu **eklenmez**. Bunun yerine **tek aktif oturum** modeli:

- `app_meta.active_auth_user_id` ile aktif kullanıcı izlenir
- Hesap değişiminde session tabloları sıfırlanır (veri sızıntısı önlenir)
- Aynı kullanıcı tekrar giriş yapınca local veri korunur

Phase 2 (opsiyonel): habits için Firestore sync veya `userId` scoped SQLite.

## Sonuçlar

- Android Play internal test: misafir akışı local veriyle çalışır
- Kayıtlı kullanıcı bookmark/chat kaybı azalır
- Store “hesap/veri silme” gereksinimleri karşılanır
- Tam multi-device habit sync **MVP dışı** — PRD’de açıkça belirtilir

## Doğrulama

- Unit: sign out local habits korunur
- Unit: outbox bookmark enqueue + flush
- Unit: reset remote + local
- E2E Maestro: habit → çıkış → tekrar giriş → habit durur
