# ADR 001: Sunucu Tarafı AI Kota ve Rate Limit

## Durum

Kabul edildi — MVP stub ile (FAZ 10)

## Bağlam

MindAlign şu anda AI kullanım kotasını cihazdaki SQLite (`ai_usage`) tablosunda tutuyor. Bu yaklaşım:

- Uygulama verisi silinerek veya DB manipülasyonu ile **kolayca bypass** edilebilir
- Çoklu cihaz / yeniden kurulum senaryolarında tutarsız kalır
- Maliyet kontrolü (Gemini API) istemci tarafında garanti edilemez

Production NO-GO raporu P0 #2 olarak sunucu tarafı kota zorunluluğunu işaret etti.

## Karar

1. **ServerAiQuotaPort** sözleşmesi tanımlanır (`getUsage`, `consume`, `addBonus`).
2. **Cloud Functions (HTTP)** üzerinde atomik kota artırımı MVP stub olarak eklenir (`MindAlign/functions/`).
3. İstemci **`EXPO_PUBLIC_SERVER_AI_QUOTA=true`** ile sunucu kotasına geçer; aksi halde local SQLite (dev/test).
4. **Remote Config kill switch:** `ai_enabled=false` → AI çağrısı yapılmaz, güvenli mesaj döner.
5. **Model allowlist:** RC'den gelen model adları allowlist dışındaysa güvenli varsayılanlara düşer.

## Mimari (MVP)

```text
CoachChatView → BustExcuseChatUseCase
                    ↓
              AiUsageRepository
         ┌──────────┴──────────┐
   Drizzle (local)     ServerBacked (HTTP → Cloud Function → Firestore txn)
```

### Cloud Function sorumlulukları (hedef)

- Firebase Auth token doğrulama
- `users/{uid}/aiUsage/{weekStart}` dokümanında **transaction** ile sayaç artırımı
- Premium / free limit + bonus sayısını sunucuda hesaplama
- `ai_enabled` RC bayrağını sunucuda da kontrol etme (Phase 2)

### Bilinen MVP sınırları

- İstemci hâlâ AI çağrısından **önce** local ön-kontrol yapıyor; tam maliyet koruması için **consume-before-generate** (Phase 2) gerekir.
- `@react-native-firebase/functions` yerine HTTP adapter kullanılıyor; deploy sonrası `EXPO_PUBLIC_AI_QUOTA_BASE_URL` set edilmeli.

## Alternatifler

| Alternatif | Neden reddedildi |
|---|---|
| Yalnızca local SQLite | Bypass edilebilir — production NO-GO |
| Firestore client write | Güvenlik kuralları atomik limit kontrolünü garanti etmez |
| Tam backend (Node API) | Firebase ekosistemiyle hizalı Functions daha düşük operasyon yükü |

## Rollout

1. **Android internal test:** `EXPO_PUBLIC_SERVER_AI_QUOTA=false` (local kota, reklam kapalı)
2. **Functions deploy + Auth:** flag `true`, base URL EAS secret
3. **Operasyon:** RC `ai_enabled` acil kapatma anahtarı

## Doğrulama

- `pnpm test:ci` — port sözleşmesi + factory testleri
- Production guard — mock ads bayrakları kapalı
- Maestro — kota duvarında “reklam izle” görünmez (ads disabled)
