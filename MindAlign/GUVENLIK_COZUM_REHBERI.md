# MindAlign — 8 Bulgu Çözüm Rehberi

Bu rehber, code review’da tespit edilen F-1 … F-8 bulgularını kapatmak içindir.

**Durum özeti**

| ID  | Konu                           | Kim yapar                  | Durum            |
| --- | ------------------------------ | -------------------------- | ---------------- |
| F-1 | CRLF / lint kapısı             | Agent (kod) + sen (commit) | Kod tarafı hazır |
| F-2 | AI kotası / maliyet abuse      | **Sen** (Firebase Console) | Bekliyor         |
| F-3 | Çift kriz tespiti              | Agent (kod)                | Tamamlandı       |
| F-4 | setState-in-effect             | Agent (kod)                | Tamamlandı       |
| F-5 | Deeplink sanitize              | Agent (kod)                | Tamamlandı       |
| F-6 | Preclassifier prompt injection | Agent (kod)                | Tamamlandı       |
| F-7 | At-rest şifreleme              | **Sen** (karar / ileride)  | Bilgilendirme    |
| F-8 | pnpm audit (dev deps)          | **Sen** (periyodik)        | İzleme           |

---

## F-1 — CRLF / lint kapısı kırık

### Agent yaptı

- `MindAlign/.gitattributes` eklendi (`* text=auto eol=lf`)
- `pnpm format` ile satır sonları LF’ye çekildi

### Sen yap

1. Değişiklikleri gözden geçir: `git diff --stat`
2. Doğrula:
   ```bash
   cd MindAlign
   pnpm lint
   pnpm format:check
   ```
3. CI kullanıyorsan lint adımının yeşil olduğundan emin ol.
4. Commit mesajı önerisi: `chore: normalize line endings and fix lint gate`

### Not

Windows’ta yeni dosyalar için Cursor/VS Code’da **EOL: LF** seçili olsun (status bar).

---

## F-2 — AI kotası yalnızca istemci tarafında (maliyet riski)

Bu bulgu **kodla tam kapanmaz**; Firebase tarafında zorunlu adımlar var.

### Sen yap (sırayla)

#### 1. App Check enforcement aç (T-160)

1. [Firebase Console](https://console.firebase.google.com) → projen → **App Check**
2. iOS ve Android uygulamalarını kaydet (Play Integrity / App Attest)
3. **Enforcement**’ı şunlar için aç:
   - Cloud Firestore (sync kullanıyorsan)
   - **Firebase AI Logic / Vertex AI** (Gemini çağrıları)
4. Dev build’lerde debug token’ların Console’da tanımlı olduğundan emin ol (`.env` → `EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_*`)

#### 2. Bütçe ve alarm kur

1. Google Cloud Console → **Billing** → **Budgets & alerts**
2. Firebase/Gemini için aylık bütçe + %50 / %90 / %100 e-posta uyarısı
3. Firebase Console → **Usage and billing** → anormal artışları haftalık kontrol et

#### 3. (Opsiyonel, ileri seviye) Sunucu tarafı kota

Tam abuse koruması için Cloud Functions + Firestore `users/{uid}/aiUsage` ile sunucu tarafı sayaç gerekir. Lansman öncesi zorunlu değil; maliyet alarmı + App Check çoğu senaryo için yeterli başlangıç.

### Doğrulama

- App Check enforcement açıkken debug token olmayan build’den AI çağrısı **reddedilmeli**
- Prod build’de normal kullanıcı akışı çalışmalı

---

## F-3 — Çift / ölü kriz tespiti

### Agent yaptı

- Tek kaynak: `detectCrisis()` (`crisis-guardrail.ts`)
- `preclassifier.ts` artık `detectCrisis` kullanıyor
- `canıma kıy` ifadesi tek listede

### Sen yap

- Ekstra iş yok. İsteğe bağlı: beta’da kriz ifadelerini manuel dene (TR/EN).

---

## F-4 — setState-in-effect / stale closure

### Agent yaptı

- `subscription-container.tsx`: `refreshOfferings` → `useCallback` + doğru dependency array

### Sen yap

- Ekstra iş yok. Paywall / abonelik ekranını bir kez açıp offerings yüklenmesini kontrol et.

---

## F-5 — Notification deeplink sanitize

### Agent yaptı

- `habitId` format doğrulaması (`^[a-zA-Z0-9-]{1,64}$`)
- `encodeURIComponent` ile route üretimi
- Geçersiz `habitId` / `deeplink` → `null`

### Sen yap

1. Emülatör/cihazda bildirime dokun → ilgili habit sohbeti açılsın
2. Maestro varsa: `pnpm test:e2e` (notification akışı)

---

## F-6 — Preclassifier prompt injection

### Agent yaptı

- Girdi 500 karakterle sınırlandı (`MAX_PRECLASSIFIER_INPUT_LENGTH`)
- LLM prompt’unda mesaj `JSON.stringify` ile güvenli biçimde gönderiliyor

### Sen yap

- Ekstra iş yok. İleride LLM preclassifier’ı prod’da açarsan maliyeti izle.

---

## F-7 — Yerel veri at-rest şifrelenmemiş (SQLite)

### Sen yap (karar)

**Lansman için zorunlu değil.** Modern cihaz disk şifrelemesi çoğu kullanıcıyı kapsar.

İleride hassas veri artarsa:

1. `expo-sqlite` SQLCipher / şifreli DB seçeneklerini değerlendir
2. Export JSON’da hassas alanları minimize et
3. Store Privacy Label / Data Safety formlarında “local storage” net yaz (T-158)

---

## F-8 — pnpm audit: 3 moderate (dev-only)

Paketler: `esbuild`, `uuid`, `js-yaml` — **prod runtime’a girmez**, build/test zincirinde.

### Sen yap (periyodik, T-165)

1. Her ay veya major Expo SDK güncellemesinde:
   ```bash
   cd MindAlign
   pnpm audit
   ```
2. Expo SDK güncellemesi çıktığında:
   ```bash
   pnpm update expo @expo/cli --latest
   pnpm audit
   ```
3. Kritik (high/critical) **runtime** bağımlılığı çıkarsa hemen patch; moderate dev-only için rapora not düş, lansmanı bloklama.

### Doğrulama

- `pnpm audit` çıktısını T-165 checklist’ine ekle
- Prod APK/IPA içinde bu paketlerin olmadığını bil (transitive dev deps)

---

## Hızlı kontrol listesi (lansman öncesi)

- [ ] `pnpm test` — 125 test yeşil
- [ ] `pnpm typecheck` — temiz
- [ ] `pnpm lint` — temiz (F-1 sonrası)
- [ ] Firebase App Check enforcement açık (F-2)
- [ ] GCP bütçe alarmı kurulu (F-2)
- [ ] Bildirim deeplink manuel test (F-5)
- [ ] `pnpm audit` raporu arşivlendi (F-8)

---

_Son güncelleme: code review follow-up — F-1, F-3–F-6 kod düzeltmeleri uygulandı._
