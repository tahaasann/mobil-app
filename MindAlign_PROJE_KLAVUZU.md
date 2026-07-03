# MindAlign — Proje Klasör ve Dosya Rehberi

Bu belge `MindAlign/` klasöründeki her bir **ana klasör** ve **kök dosyanın** ne işe yaradığını açıklar.  
Amaç: Projeye yeni bakan bir geliştiricinin “bu dosya neden var?” sorusuna hızlı cevap bulması.

**Mimari özeti:** Hexagonal (ports & adapters). Akış kabaca:

```
src/app (ekranlar)
  → src/presentation (UI, hook'lar)
    → src/application (use-case'ler, port arayüzleri)
      → src/domain (saf iş kuralları)
      → src/infrastructure (Firebase, SQLite, AdMob, RevenueCat…)
```

---

## 1. Kök dizin — klasörler

| Klasör | Ne işe yarar? | Neden burada? | Dokunma seviyesi |
|--------|---------------|---------------|------------------|
| `src/` | Uygulamanın tüm TypeScript kaynak kodu (ekranlar, iş mantığı, altyapı). | Ana geliştirme alanı; mimari katmanlar burada. | **Sık** |
| `assets/` | Uygulama ikonları, splash görselleri, tab ikonları, favicon. | Expo/React Native statik görselleri buradan okur. | Orta |
| `android/` | Native Android projesi (`prebuild` sonrası oluşur/güncellenir). Gradle, manifest, native modül bağlantıları. | Firebase, bildirimler, SQLite, RevenueCat gibi native modüller için zorunlu. | Orta (çoğunlukla `prebuild` yönetir) |
| `drizzle/` | SQLite veritabanı **migration** SQL dosyaları ve meta snapshot'ları. | Yerel DB şema değişikliklerini sürümler; uygulama açılışında uygulanır. | Migration eklerken |
| `docs/` | Ek proje dokümantasyonu (ör. RevenueCat kurulum notları). | README dışındaki operasyonel rehberler. | Nadiren |
| `__tests__/` | Kök seviye Jest testleri (smoke, path alias). | Proje geneli hızlı doğrulama testleri. | Test yazarken |
| `__mocks__/` | Jest için modül mock'ları (SQL, stil). | Test ortamında native/heavy modülleri taklit eder. | Test altyapısı |
| `.maestro/` | Maestro E2E test senaryoları (YAML). | Uçtan uca kullanıcı akışlarını otomatik test eder. | E2E yazarken |
| `.vscode/` | VS Code / Cursor önerilen eklentiler ve workspace ayarları. | Takım içi tutarlı editör deneyimi. | İsteğe bağlı |
| `.expo/` | Expo CLI cache, typed routes, dev logları, cihaz listesi. | `expo start` / `prebuild` sırasında otomatik üretilir. | **Dokunma** (cache) |
| `node_modules/` | `pnpm install` ile indirilen npm paketleri. | Bağımlılık ağacı; elle düzenlenmez. | **Dokunma** |

### Otomatik / geçici alt klasörler (bilgi amaçlı)

| Klasör | Kısa açıklama |
|--------|----------------|
| `android/.gradle/`, `android/build/`, `android/app/build/` | Gradle derleme cache ve çıktıları. Silinebilir; bir sonraki build'de yeniden oluşur. |
| `android/.kotlin/` | Kotlin derleyici hata logları (build sorunlarında bakılır). |
| `.expo/cache/`, `.expo/dev/logs/` | Expo geliştirme cache ve log dosyaları. |

---

## 2. Kök dizin — dosyalar

| Dosya | Ne işe yarar? | Neden burada? |
|-------|---------------|---------------|
| `package.json` | Proje adı, npm script'leri (`start`, `android`, `test`…), bağımlılık listesi. | Node/Expo projesinin merkezi manifestosu. |
| `pnpm-lock.yaml` | Bağımlılık sürümlerinin kilitli listesi. | Tekrarlanabilir kurulum için. |
| `pnpm-workspace.yaml` | pnpm monorepo workspace tanımı (tek paket olsa bile). | pnpm workspace yapılandırması. |
| `app.config.ts` | Expo uygulama yapılandırması: bundle id, plugin'ler (Firebase, AdMob, bildirimler), EAS project id. | `app.json` yerine tip güvenli dinamik config. |
| `eas.json` | EAS Build / Submit profilleri (development, preview, production). | Bulutta native build almak için. |
| `tsconfig.json` | TypeScript derleyici ayarları, `@/` path alias. | Tip kontrolü ve import kısayolları. |
| `babel.config.js` | Babel dönüşümleri (Expo preset, NativeWind, inline SQL import). | Metro bundler'ın JS derlemesi. |
| `metro.config.js` | Metro bundler ayarları (Expo varsayılan + özelleştirmeler). | JS paketleme pipeline'ı. |
| `tailwind.config.js` | Tailwind / NativeWind tema (renkler, fontlar). | `className="..."` stil sistemi. |
| `nativewind-env.d.ts` | NativeWind için TypeScript tip tanımları. | Tailwind class'larının TS'te tanınması. |
| `eslint.config.js` | ESLint + Prettier kuralları. | `pnpm lint` ile kod kalitesi. |
| `.prettierrc` | Prettier format kuralları. | Otomatik kod biçimlendirme. |
| `.prettierignore` | Prettier'ın atlayacağı dosyalar. | Lock dosyası, build çıktıları vb. |
| `.editorconfig` | Editörler arası girinti/satır sonu tutarlılığı. | CRLF/LF sorunlarını azaltır. |
| `.gitattributes` | Git'te satır sonu normalizasyonu (`text eol=lf`). | CI/lint uyumu için. |
| `.gitignore` | Git'e commit edilmeyecek dosyalar (`.env`, `node_modules`, build…). | Gizli/üretilmiş dosyaları dışarıda tutar. |
| `jest.config.js` | Jest test runner yapılandırması. | `pnpm test`. |
| `jest.setup.ts` | Jest global setup (mock'lar, test ortamı). | Her test dosyasından önce çalışır. |
| `drizzle.config.ts` | Drizzle Kit yapılandırması (`db:generate` için). | Migration SQL üretmek için. |
| `react-native.config.js` | React Native autolinking özelleştirmesi (ör. `EXPO_PUBLIC_ADS_MOCK=true` iken AdMob native'i devre dışı). | Native modül bağlantısını koşullu yönetir. |
| `expo-env.d.ts` | Expo typed routes / env tip tanımları (otomatik güncellenir). | TypeScript route güvenliği. |
| `.env` | Yerel gizli ortam değişkenleri (commit edilmez). | API anahtarları, mock bayrakları, App Check token. |
| `.env.example` | `.env` için şablon; hangi değişkenlerin gerekli olduğunu gösterir. | Yeni geliştirici onboarding. |
| `google-services.json` | Firebase Android yapılandırması (commit edilmemeli; yerelde durur). | Native Firebase SDK'nın projeyi tanıması. |
| `GoogleService-Info.plist` | Firebase iOS yapılandırması (yerelde). | iOS Firebase entegrasyonu. |
| `firestore.rules` | Firestore güvenlik kuralları taslağı. | Firebase Console'a deploy edilir. |
| `README.md` | Kurulum, script'ler, kısa proje tanımı. | İlk bakış rehberi. |
| `GUVENLIK_COZUM_REHBERI.md` | Güvenlik denetimi bulguları ve çözüm checklist'i. | Launch öncesi güvenlik takibi. |
| `LICENSE` | Lisans metni. | Yasal kullanım şartları. |
| `admob-build.log` | Geçici Android build log dosyası (debug sırasında oluşmuş). | **Silinebilir**; projeye ait kalıcı dosya değil. |

---

## 3. `src/` — genel yapı

| Klasör / dosya | Katman | Ne işe yarar? |
|----------------|--------|---------------|
| `src/app/` | UI (routing) | Expo Router ekranları; URL → sayfa eşlemesi. |
| `src/presentation/` | UI | Yeniden kullanılabilir bileşenler, hook'lar, tema, i18n. |
| `src/application/` | Uygulama | Use-case'ler ve port (arayüz) tanımları. |
| `src/domain/` | Domain | Saf iş kuralları; framework bağımsız. |
| `src/infrastructure/` | Altyapı | Port'ların gerçek implementasyonları (Firebase, DB, AdMob…). |
| `src/components/` | UI (legacy/kök) | Expo template'den kalan splash animasyon bileşenleri. |
| `src/hooks/` | UI (legacy/kök) | Renk şeması / tema hook'ları (Expo template kalıntısı). |
| `src/constants/` | UI | Tema sabitleri. |
| `src/global.css` | UI | NativeWind / global Tailwind CSS giriş dosyası. |

---

## 4. `src/app/` — ekranlar (Expo Router)

| Dosya / klasör | Ne işe yarar? | Neden burada? |
|-----------------|---------------|---------------|
| `_layout.tsx` | Kök layout: DB, Firebase, i18n, tema, DI container'ları sarar; Stack navigator. | Tüm ekranların ortak başlatma noktası. |
| `index.tsx` | Uygulama giriş yönlendirmesi: onboarding → auth → tabs. | İlk açılışta doğru akışa yönlendirir. |
| `(tabs)/_layout.tsx` | Alt tab bar: Ana sayfa, Koç, Kaydedilenler, Profil. | 4 ana menü navigasyonu. |
| `(tabs)/index.tsx` | Alışkanlık takip dashboard'u. | FAZ 1 çekirdek ekran. |
| `(tabs)/chat.tsx` | AI koç sohbeti; üstte alışkanlık/genel konu dropdown. | FAZ 2+ chat sekmesi. |
| `(tabs)/saved.tsx` | Bookmark'lanmış mesajlar listesi. | FAZ 4 kayıtlı mesajlar. |
| `(tabs)/profile.tsx` | Profil, abonelik, dil/tema ayarları. | FAZ 6–7 profil sekmesi. |
| `(tabs)/settings.tsx` | Eski ayarlar rotası → profile redirect. | Geriye dönük deep link uyumu. |
| `onboarding/index.tsx` | İlk kurulum: profil, alışkanlık seçimi, yaklaşım. | FAZ 3 onboarding akışı. |
| `auth/index.tsx` | Giriş / misafir giriş ekranı. | FAZ 4 kimlik doğrulama. |
| `paywall/index.tsx` | Abonelik / premium satış ekranı (modal). | FAZ 6 monetization. |
| `breathing/index.tsx` | Nefes egzersizi modal ekranı. | Stres anı mikro müdahale. |
| `excuse/[habitId].tsx` | Alışkanlık kartından açılan bahane sohbeti (modal). | Dashboard → chat kısayolu. |
| `__tests__/` | Ekran seviyesi entegrasyon testleri. | Dashboard, chat, saved smoke testleri. |

---

## 5. `src/application/` — use-case'ler ve port'lar

### `ports/` — arayüzler (ne yapılacağını tanımlar, nasıl yapılacağını değil)

| Port dosyası | Sorumluluk |
|--------------|------------|
| `ai-coach.port.ts` | AI koç API sözleşmesi (bahane analizi, yanıt). |
| `auth.port.ts` | Oturum açma, çıkış, kullanıcı durumu. |
| `habit-repository.port.ts` | Alışkanlık CRUD. |
| `habit-log-repository.port.ts` | Günlük alışkanlık logları (success/rescued/failed). |
| `bookmark-repository.port.ts` | Kaydedilen mesajlar. |
| `chat-message-repository.port.ts` | Sohbet geçmişi kalıcılığı. |
| `user-profile-repository.port.ts` | Kullanıcı profili. |
| `app-settings-repository.port.ts` | Dil, tema, yaklaşım, onboarding bayrakları. |
| `app-meta-repository.port.ts` | Küçük key-value meta (ör. review istendi mi). |
| `ai-usage-repository.port.ts` | Haftalık AI kota sayacı. |
| `user-data.port.ts` | Export / oturum temizleme / reset. |
| `sync.port.ts` | Firestore ile çift yönlü senkron. |
| `notification.port.ts` | Yerel bildirim planlama/iptal. |
| `subscription.port.ts` | RevenueCat abonelik işlemleri. |
| `ads.port.ts` | Ödüllü reklam (AdMob). |
| `analytics.port.ts` | Olay loglama. |
| `crash-reporting.port.ts` | Crashlytics hata raporlama. |
| `remote-config.port.ts` | Firebase Remote Config (model adı, kota limitleri). |
| `review.port.ts` | Mağaza değerlendirme istemi. |
| `health-repository.port.ts` | DB sağlık / migration durumu. |

### `use-cases/` — iş akışları (seçilmiş)

| Use-case | Ne yapar? |
|----------|-----------|
| `bust-excuse-chat.use-case.ts` | Bahane gönder → kriz kontrolü → kota → AI yanıt. |
| `rescue-streak.use-case.ts` | Seri kurtarma / vazgeçme logları. |
| `log-habit.use-case.ts` | Alışkanlığı tamamlandı olarak işaretle. |
| `get-dashboard.use-case.ts` | Dashboard için alışkanlık + streak + heatmap verisi. |
| `save-onboarding.use-case.ts` | Onboarding verilerini kaydet. |
| `auth-session.use-case.ts` | Oturum değişiminde veri izolasyonu. |
| `sync-on-login.use-case.ts` | Giriş sonrası Firestore senkron. |
| `subscription.use-case.ts` | Satın alma, restore, premium kontrol. |
| `notification.use-case.ts` | Bildirim izni ve yeniden planlama. |
| `settings.use-case.ts` | Veri export, reset, review isteği. |
| `bookmark.use-case.ts` | Mesaj kaydet / sil. |
| `chat-message.use-case.ts` | Sohbet mesajı listele / kaydet. |
| `health-check.use-case.ts` | Uygulama sağlık kontrolü. |
| `__tests__/` | Use-case birim testleri. |

---

## 6. `src/domain/` — saf iş kuralları

| Klasör / dosya | Ne işe yarar? |
|----------------|---------------|
| `entities/` | Veri modelleri: `habit`, `habit-log`, `user-profile`, `chat-message`, `bookmark`, `app-settings`. |
| `ai/` | AI prompt, kriz guardrail, ön sınıflandırıcı, kota, İslami içerik politikası, barrier JSON şeması. |
| `services/streak-calculator.ts` | Seri (streak) hesaplama mantığı. |
| `notifications/` | Bildirim zamanlama kuralları, deep link parse. |
| `breathing/` | Nefes egzersizi döngü zamanlaması. |
| `sync/merge-records.ts` | Yerel ↔ bulut kayıt birleştirme stratejisi. |
| `utils/date.ts` | Yerel tarih yardımcıları (timezone-aware). |
| `__tests__/` (alt klasörlerde) | Domain birim testleri. |

---

## 7. `src/infrastructure/` — dış dünya adaptörleri

| Klasör | Ne işe yarar? | Gerçek / mock |
|--------|---------------|---------------|
| `firebase/` | Auth, Firestore sync, AI coach, Analytics, Crashlytics, Remote Config, App Check bootstrap. | `.env` mock bayraklarına göre mock veya gerçek adapter. |
| `database/` | Expo SQLite + Drizzle ORM: şema, migration gate, repository implementasyonları. | Her zaman yerel. |
| `database/repositories/` | `drizzle-*.repository.ts` — port'ların SQLite karşılıkları. | |
| `di/` | React context DI: `app-container`, `auth-container`, `platform-container`, `subscription-container`. | Uygulama genelinde bağımlılık enjeksiyonu. |
| `ads/` | AdMob ödüllü reklam + mock ads. | `EXPO_PUBLIC_ADS_MOCK` |
| `subscriptions/` | RevenueCat + mock subscription. | `EXPO_PUBLIC_SUBSCRIPTION_MOCK` / API key |
| `notifications/` | Expo notifications adapter + mock. | `EXPO_PUBLIC_NOTIFICATION_MOCK` |
| `reviews/` | Expo Store Review + mock. | |
| `config/production-guard.ts` | Production'da mock bayrak ve eksik anahtarları engeller. | Launch güvenliği. |

---

## 8. `src/presentation/` — UI katmanı

| Klasör | Ne işe yarar? |
|--------|---------------|
| `components/` | UI bileşenleri: `habit-card`, `coach-chat-view`, `paywall-sheet`, `quota-wall`, `microtask-card`, `glass-card`… |
| `components/__tests__/` | Bileşen birim testleri. |
| `hooks/` | `use-habits`, `use-excuse-chat`, `use-bookmarks`, `use-app-settings`… |
| `hooks/__tests__/` | Hook testleri. |
| `theme/` | Tema provider, light/dark/auto çözümleme. |
| `i18n/` | Çoklu dil: `locales/en.json`, `tr.json`, `ar.json`, `fr.json`, `ja.json`. |
| `chat/chat-topic.ts` | Genel sohbet vs alışkanlık bazlı chat konu modeli. |
| `notifications/notification-content.ts` | Bildirim metin şablonları. |
| `utils/speech.ts` | TTS (expo-speech) yardımcıları. |

---

## 9. `assets/` — görseller

| Klasör / dosya | Ne işe yarar? |
|----------------|---------------|
| `images/icon.png` | Uygulama ikonu (Expo `app.config.ts`). |
| `images/splash-icon.png` | Splash ekran görseli. |
| `images/android-icon-*.png` | Android adaptive icon katmanları. |
| `images/favicon.png` | Web favicon. |
| `images/logo-glow.png` | Marka / splash animasyon görseli. |
| `images/tabIcons/` | Tab bar ikonları (gelecekte kullanım için). |
| `expo.icon/` | iOS Expo icon asset bundle. |

---

## 10. `drizzle/` — veritabanı migration'ları

| Dosya | Ne işe yarar? |
|-------|---------------|
| `0000_*.sql` … `0005_*.sql` | Sıralı şema değişiklikleri (tablo ekleme, kolon, ai_usage bonus…). |
| `migrations.js` | Uygulama içi migration runner'ın okuduğu bundle. |
| `meta/_journal.json` | Migration sırası kaydı. |
| `meta/*_snapshot.json` | Drizzle Kit şema snapshot'ları (generate sırasında). |

Yeni migration: `pnpm db:generate` → SQL buraya düşer → `database-provider` açılışta uygular.

---

## 11. `android/` — native Android (özet)

| Dosya / klasör | Ne işe yarar? | Dokunma |
|----------------|---------------|---------|
| `settings.gradle` | Hangi native modüllerin bağlandığı (autolinking çıktısı). | `prebuild` günceller |
| `build.gradle` | Proje seviyesi Gradle yapılandırması. | Nadiren |
| `gradle.properties` | `newArchEnabled`, `hermesEnabled`, `android.kotlinVersion` vb. | `expo-build-properties` yazar |
| `gradlew`, `gradlew.bat` | Gradle wrapper script'leri. | Çalıştırılır, düzenlenmez |
| `app/build.gradle` | Uygulama modülü: SDK sürümü, signing, Firebase plugin. | `prebuild` günceller |
| `app/src/main/` | AndroidManifest, MainActivity, Kotlin/Java kaynakları. | `prebuild` günceller |
| `app/google-services.json` | Prebuild sırasında kök dosyadan kopyalanır. | Otomatik |
| `app/debug.keystore` | Debug imzalama anahtarı (yerel geliştirme). | Otomatik |
| `.gradle/`, `build/`, `app/build/` | Derleme cache ve APK/AAB çıktıları. | **Dokunma** (silinebilir) |

> **Not:** `ios/` klasörü henüz repoda yok; `pnpm expo prebuild --platform ios` ile oluşturulur.

---

## 12. `.maestro/` — E2E test akışları

| Dosya | Test ettiği akış |
|-------|------------------|
| `onboarding_to_dashboard.yaml` | Onboarding → dashboard. |
| `habit_mark_done.yaml` | Alışkanlık tamamlama. |
| `excuse_to_rescue.yaml` | Bahane → kurtarma akışı. |
| `signin_bookmark_persists.yaml` | Giriş + bookmark kalıcılığı. |
| `notification_opens_chat.yaml` | Bildirim deep link → chat. |
| `quota_upgrade_or_ad.yaml` | Kota duvarı / paywall / reklam. |
| `full_regression.yaml` | Birleşik regresyon suite. |

Çalıştırma: `pnpm test:e2e`

---

## 13. `.env` değişkenleri (özet)

| Değişken | Amaç |
|----------|------|
| `APP_ENV` | `development` / `preview` / `production` — production guard tetikler. |
| `EXPO_PUBLIC_AI_MOCK` | Firebase AI yerine mock koç. |
| `EXPO_PUBLIC_ADS_MOCK` | AdMob yerine mock reklam; native AdMob autolink'i kapatır. |
| `EXPO_PUBLIC_AUTH_MOCK` | Mock auth adapter. |
| `EXPO_PUBLIC_SUBSCRIPTION_MOCK` | Mock RevenueCat. |
| `EXPO_PUBLIC_*_MOCK` (diğer) | Sync, notification, analytics, crashlytics, remote config, review. |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | RevenueCat SDK anahtarı. |
| `EXPO_PUBLIC_ADMOB_*` | AdMob app id ve rewarded unit id (platform bazlı). |
| `EXPO_PUBLIC_GEMINI_*` | AI model adları. |
| `EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN_*` | App Check debug token (Android/iOS). |

Tam liste: `.env.example`

---

## 14. Repo kökü (`NewLifeApp/`) — MindAlign dışı (bağlam)

MindAlign klasörünün **bir üst dizininde** duran, monorepo/repo seviyesi dosyalar:

| Dosya / klasör | Ne işe yarar? |
|----------------|---------------|
| `MindAlign/` | Bu rehberin konusu olan uygulama. |
| `.github/workflows/ci.yml` | GitHub Actions: lint + typecheck + test (`MindAlign/` dizininde). |
| `MindAlign_TODO_TracerBullet.md` | FAZ 0–8 geliştirme checklist'i. |
| `MindAlign_PRD.md` | Ürün gereksinim dokümanı (varsa). |

---

## 15. Geliştirici için hızlı “nereye bakmalıyım?”

| Görev | Bakılacak yer |
|-------|---------------|
| Yeni ekran | `src/app/` |
| UI bileşeni | `src/presentation/components/` |
| İş kuralı değiştir | `src/domain/` veya `src/application/use-cases/` |
| Firebase / API | `src/infrastructure/firebase/` |
| Yerel DB / tablo | `src/infrastructure/database/schema.ts` + `drizzle/` |
| Çeviri metni | `src/presentation/i18n/locales/*.json` |
| Native build sorunu | `android/`, `app.config.ts`, `.env` |
| Güvenlik / launch | `GUVENLIK_COZUM_REHBERI.md` |
| Test | `src/**/__tests__/`, `__tests__/`, `.maestro/` |

---

*Son güncelleme: proje `phase-7-polish` branch yapısına göre hazırlanmıştır.*
