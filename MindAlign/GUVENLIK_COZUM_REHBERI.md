# MindAlign — Güvenlik & Codex Denetim Çözüm Rehberi

Bu dosya iki kaynağı birleştirir:
1. İlk code review (F-1 … F-8)
2. OpenAI Codex GPT 5.5 Extra High denetim raporu (C-1 … C-45)

**Son doğrulama:** `pnpm test` → **126/126** · `pnpm lint` → **0 error**

---

## Durum özeti

| ID | Konu | Kim | Durum |
|----|------|-----|--------|
| F-1 | CRLF / lint | Agent ✓ | Tamamlandı |
| F-2 | AI kota (sunucu) | **Sen** | Bekliyor |
| F-3 | Çift kriz tespiti | Agent ✓ | Tamamlandı |
| F-4 | setState-in-effect | Agent ✓ | Tamamlandı |
| F-5 | Deeplink sanitize | Agent ✓ | Tamamlandı |
| F-6 | Preclassifier injection | Agent ✓ | Tamamlandı |
| F-7 | At-rest şifreleme | **Sen** (karar) | İleride |
| F-8 | pnpm audit dev deps | **Sen** (periyodik) | İzleme |
| C-1 | Hesap veri karışması | Agent ✓ (kısmi) | Kısmi — sunucu tombstone senin |
| C-2 | Kapalı Gemini modelleri | Agent ✓ | Tamamlandı |
| C-3 | Kriz / kota sırası + 182 | Agent ✓ | Tamamlandı |
| C-4 | Kota istismarı | **Sen** | Sunucu tarafı gerekli |
| C-5 | Misafir sync vaadi | Agent ✓ | Tamamlandı |
| C-6 | Veri silme eksik | Agent ✓ (kısmi) | Kısmi — Firestore silme senin |
| C-7 | Prod mock fail-fast | Agent ✓ | Tamamlandı |
| C-8 | App Check yarış | Agent ✓ (kısmi) | Kısmi — enforcement senin |
| C-9 | SQLite şifreleme | **Sen** | İleride |
| C-10 | Export mahremiyeti | Agent ✓ | Uyarı eklendi |
| C-11 | RevenueCat UID | Agent ✓ | Tamamlandı |
| C-12 | RC configure yarış | Agent ✓ | Tamamlandı |
| C-13 | iOS AdMob ID | Agent ✓ | Tamamlandı |
| C-14 | “Sınırsız AI” metni | Agent ✓ | Tamamlandı |
| C-15 | Streak 7 gün limiti | Agent ✓ | Tamamlandı |
| C-16 | UTC tarih | Agent ✓ | Tamamlandı |
| C-17 | Bildirim lifecycle | Agent ✓ (kısmi) | Kısmi |
| C-18 | Onboarding sırası | Agent ✓ | Tamamlandı |
| C-19–C-45 | Diğer orta/düşük | Karışık | Aşağıda |

---

## Agent tarafında yapılan kod düzeltmeleri (özet)

### Oturum & veri izolasyonu (C-1, C-5, C-6 kısmi)
- `HandleAuthSessionUseCase`: farklı UID → yerel oturum temizle + bildirim iptali; **anonim kullanıcıda sync kapalı**
- `SignOutSessionUseCase`: çıkışta yerel veri + bildirim + RevenueCat `logOut` + meta temizliği
- `UserDataPort.clearSessionData()`: app_settings korunur, kullanıcı tabloları silinir
- `ResetUserDataUseCase`: bildirimleri de iptal eder

### AI & güvenlik (C-2, C-3, C-20 kısmi)
- Varsayılan modeller: `gemini-2.5-flash` / `gemini-2.5-flash-lite`
- Remote Config `gemini_model` + `gemini_lite_model` → AI adaptörüne enjekte
- **Kriz kontrolü kota kontrolünden önce** (quota dolu olsa bile kriz yanıtı)
- Kriz kaynakları düzeltildi (182 = MHRS; acil 112 öne çıkarıldı)
- TR/EN/AR/FR/JA kriz kalıpları genişletildi
- Prompt builder: profil alanları sınırlandı + `JSON.stringify` + “untrusted” uyarısı

### Prod güvenliği (C-7, C-8 kısmi)
- `assertProductionConfig()`: production’da mock bayrakları / eksik RC-AdMob anahtarları → **startup hatası**
- `FirebaseProvider`: production’da App Check hata → fail-closed ekran
- Subscription/Ads container: production’da mock adaptör yasak

### Monetization & reklam (C-11, C-12, C-13, C-14)
- RevenueCat: idempotent `configure` + `Purchases.logIn(uid)` / `logOut()`
- AdMob: platforma özel `EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID` / `_IOS`
- Paywall metinleri: “sınırsız” → “haftada 60 sohbet”; trial metni mağazadan türetilecek şekilde nötrleştirildi

### UX & doğruluk (C-15, C-16, C-18, C-10, C-22)
- Streak: tüm log geçmişi; heatmap ayrı 7 gün
- Takvim günü: yerel timezone (`todayLocal`)
- Onboarding: profil/alışkanlıklar önce, `onboardingCompleted` en son
- Export: onay diyaloğu + düz JSON uyarısı
- Otomatik TTS kaldırıldı (excuse ekranı)

### Diğer (F-3–F-6, C-24)
- Deeplink: `try/catch` + habitId doğrulama
- Hook’lar: promise rejection → loading takılı kalmaz
- README güncellendi; `.env.example` genişletildi

---

## Senin yapman gerekenler — KRİTİK (lansman öncesi zorunlu)

### C-4 / F-2 — Sunucu tarafı AI kota & reklam doğrulama
Kod tek başına yeterli değil.

1. Firebase Console → **App Check enforcement** aç (Firestore + **Firebase AI Logic**)
2. GCP **Billing budget + alarm** kur
3. (Önerilen) Cloud Functions:
   - `users/{uid}/aiUsage/{week}` transaction ile kota say
   - Rewarded ad SSV veya sunucu tarafı bonus doğrulama
4. Firestore rules: AI usage koleksiyonu yalnızca authenticated + App Check

### C-6 — Gerçek “tüm veriyi sil”
Şu an: yerel silme + bildirim iptali var; **Firestore verisi silinmiyor**.

1. Ayarlarda iki seçenek ayır:
   - “Yerel veriyi temizle” (mevcut)
   - “Hesabı ve bulut verisini sil” (yeni — Firebase Auth delete + Firestore batch delete)
2. Silme sonrası **tombstone** (`deletedAt`) ekle ki sync geri yüklemesin
3. T-157 gizlilik metinlerini buna göre güncelle

### C-1 tam kapanış — Hesap linking
1. Firebase **anonymous → email/Google link** akışı ekle (C-43 ile bağlantılı)
2. Beta’da senaryo testi: A giriş → veri → çıkış → B giriş → A verisi B’ye gitmemeli ✓ (kodda)

### C-2 — Remote Config (Firebase Console)
Production Remote Config’te şunları ayarla:
```
gemini_model = gemini-2.5-flash
gemini_lite_model = gemini-2.5-flash-lite
free_weekly_quota = 3
premium_weekly_quota = 60
```

### C-7 / Production env (EAS)
EAS Secrets’e ekle (mock bayrakları **kapalı**):
```
APP_ENV=production
EXPO_PUBLIC_REVENUECAT_API_KEY=...
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=...
EXPO_PUBLIC_ADMOB_APP_ID_IOS=...
EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_ANDROID=...
EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID_IOS=...
```
Firebase config dosyaları: [EAS file env vars](https://docs.expo.dev/eas/environment-variables/faq/)

### C-33 — App Check debug token
`EXPO_PUBLIC_*` debug token bundle’da görünür. Production debug build için EAS **secret** (non-public) kullan.

---

## Senin yapman gerekenler — YÜKSEK (beta öncesi)

### C-9 — SQLite / Android backup
1. `android:allowBackup="false"` veya hassas DB backup exclusion
2. İleride SQLCipher değerlendir

### C-17 — Bildirim lifecycle (kalan)
1. Habit arşiv/silme akışı ekle → `cancelAllForHabit`
2. Profil `notifWindow` boşaltılınca tüm bildirimleri iptal et (kısmen var; habit silme yok)
3. Beta: çıkış → eski habit adı kilit ekranında görünmemeli (çıkışta cancelAll ✓)

### C-19 — Sync sağlamlaştırma
1. Firestore payload parse hatalarında karantina (invalid kayıt atla, logla)
2. Sayfalama + batch push/pull
3. Emulator rule testleri CI’a ekle

### C-23 — Route guard
1. `(authenticated)` route group + `Redirect` when `!user && !guestAllowed`
2. Deep link: auth hazır olana kadar notification navigate ertele

### C-30 — 5 dil parity
Ayarlarda yalnızca EN/TR var; AR/FR/JA locale dosyaları eksik — T-155/T-156 ile birlikte tamamla.

### C-38 / C-39 — E2E & CI
1. Maestro: gerçek kota duvarı, notification tap, auth persistence
2. CI: `expo doctor`, `pnpm audit`, Firestore rules test, native build

---

## Senin yapman gerekenler — ORTA / BACKLOG

| ID | Konu | Aksiyon |
|----|------|---------|
| C-21 | Çok turlu sohbet / LLM preclassifier prod | Chat history modele gönder; preclassifier’ı wire et |
| C-22 | TTS | Kullanıcı kontrollü “dinle” butonu + locale |
| C-25 | Habit-log upsert ID | `ON CONFLICT RETURNING` |
| C-26 | DB constraints | CHECK, FK cascade, sortOrder |
| C-28 | Çift dokunma | Debounce purchase/complete |
| C-29 | Tema/dil hydrate | App açılışında DB settings → i18n/theme |
| C-31 | Web desteği | Kaldır veya platform adaptörleri |
| C-34 | Android debug keystore | EAS signing only; yerel release uyarısı |
| C-35 | Gereksiz izinler | Manifest audit |
| C-37 | Firestore schema validation | Rules’da field whitelist + size |
| C-40 | esbuild advisory | Expo SDK güncelle; dev server LAN’a açma |
| C-43 | Auth eksikleri | Kayıt, şifre sıfırlama, hesap silme, linking |
| C-44 | Habit CRUD | Edit/delete/archive |
| C-45 | Paywall UX | Geri dönüşte context; offerings hata/retry |
| C-42 | TODO/PRD drift | Tamamlanan maddeleri gerçek durumla hizala |

---

## F-1 — CRLF / lint (tamamlandı)

- `.gitattributes` + `pnpm format`
- Doğrula: `pnpm lint && pnpm format:check`

---

## F-8 — pnpm audit (periyodik)

```bash
cd MindAlign
pnpm audit
```
3 moderate (esbuild/uuid/js-yaml) — dev zinciri; prod runtime değil. High/critical runtime çıkarsa hemen patch.

---

## Hızlı lansman checklist

- [x] `pnpm test` — 126 yeşil
- [x] `pnpm lint` — 0 error
- [ ] Firebase App Check enforcement (AI + Firestore)
- [ ] Remote Config model değerleri (2.5 flash)
- [ ] EAS production secrets (RC, AdMob, Firebase files)
- [ ] GCP bütçe alarmı
- [ ] Gizlilik metinleri (misafir vs girişli sync — T-157)
- [ ] Beta: hesap değiştirme + kriz + kota senaryoları
- [ ] Firestore hesap/bulut silme akışı (C-6)
- [ ] (Opsiyonel) Sunucu tarafı kota (C-4)

---

## Test komutları

```bash
cd MindAlign
pnpm test
pnpm typecheck
pnpm lint
pnpm audit
```

---

_Son güncelleme: Codex denetim follow-up — C-1,2,3,5,6,7,8,10–18,20,22,24 kısmi kod düzeltmeleri + F-1–F-6._
