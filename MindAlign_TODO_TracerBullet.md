# MindAlign - TODO Listesi (Tracer Bullet + Atomik + TDD)

> Bu liste [MindAlign_PRD.md](MindAlign_PRD.md) sürüm 1.3'e dayanır.
> Yöntem: **Tracer Bullet** (her faz uçtan uca çalışan ince bir dilim üretir) + **Atomik adımlar** (bölünemeyecek en küçük adım) + **TDD** (önce test - Red, sonra kod - Green, sonra Refactor).
> Kural: **Testi yazılmamış mantık (domain/use-case/adapter/önemli component) yok.** Testler ihtiyaca yönelik; saf konfigürasyon adımları için test değil, doğrulama komutu kullanılır.

---

## 0. Bu Listeyi Nasıl Kullanmalı

### Sütunlar (6)

1. **ID** - Adımın benzersiz numarası (T-001, T-002 ...).
2. **✓** - İşaretleme sütunu. Adım bitince `[ ]` -> `[x]` yap.
3. **Commit Mesajı** - O adıma ait GitHub commit (Conventional Commits: `feat:`, `test:`, `chore:`, `build:`, `ci:`, `refactor:`, `docs:`).
4. **Adım** - Tam olarak ne yapılacak.
5. **Neden** - Bu adımı niçin yapıyoruz (tracer bullet/değer gerekçesi).
6. **Onay (Doğrulama)** - Adımın başarıyla geçtiğini kanıtlayan somut kontrol (komut + beklenen sonuç).

### TDD Akışı (her mantık adımı için)

- `test:` ile başlayan adım = **Red** (önce başarısız test yazılır).
- Onu takip eden `feat:`/`refactor:` adım = **Green** (testi geçiren minimum kod) + gerekiyorsa refactor.
- Bir `test:` adımının onayı: "yeni test **kırmızı/başarısız** olmalı". Onu izleyen `feat:` adımının onayı: "ilgili testler **yeşil** + tüm suite yeşil".

### Branch & Commit Stratejisi

- Her **faz** için bir branch: `phase-0-skeleton`, `phase-1-habits` ...
- Her **adım** için bir commit (sütun 3'teki mesajla). Faz bitince PR aç -> review + güvenlik taraması -> `main`'e merge.
- Asla doğrudan `main`'e push etme; her faz PR üzerinden geçsin.

### Paket Yöneticisi

- **pnpm** (disk-verimli, hızlı). Expo SDK 56 ile `**pnpm-workspace.yaml` içinde `nodeLinker: hoisted`** kullanılır (RN native modül uyumu için zorunlu; `create-expo-app` pnpm'de otomatik koyar). EAS Build pnpm'i otomatik algılar (`pnpm-lock.yaml`).
- Komutlar: kurulum `pnpm install`, script `pnpm <script>` (ör. `pnpm test`, `pnpm lint`), tek seferlik araç `pnpm dlx <bin>` (npx yerine).
- **Sürüm kontrolü:** `pnpm-lock.yaml` commit'lenir; `package-lock.json`/`yarn.lock` repoda olmamalı.

### Test & Kalite Araçları

- **Birim/Mantık:** Jest.
- **Component:** React Native Testing Library (RNTL).
- **E2E:** Maestro (Expo/RN için pratik) - kritik kullanıcı akışları.
- **Statik:** TypeScript (strict) + ESLint + Prettier.
- AI ve dış servisler (Gemini, RevenueCat, Auth, Ads, Firestore) testlerde **mock/fake adapter** ile; gerçek ağ çağrısı testte yok.

### Definition of Done (HER adım için ortak)

Bir adım "bitti" sayılır ancak ve ancak: (a) sütun 6'daki onay sağlandı, (b) `pnpm test` tamamı yeşil, (c) `pnpm lint` ve `pnpm typecheck` hatasız, (d) gizli bilgi commit'lenmedi (bkz. Güvenlik Protokolü), (e) commit sütun 3'teki mesajla atıldı.

---

## SENİN HER ADIMDA YAPMAN GEREKENLER - Review & Güvenlik Protokolü

Her adımı ben (AI) bitirdiğimde sana: **ne değişti, hangi dosyalar, neden, ve sütun 6'daki doğrulama komutu** özetini vereceğim. Sen şu **6 adımlık rutini** uygula (kod bilmesen de yapabilirsin):

1. **Değişikliği oku:** Cursor'da Source Control (sol panel) ya da dosya diff'inden ne eklendi/değişti bak. Benden "bu adımda neyi neden değiştirdin?" diye sorabilirsin.
2. **Doğrulama komutunu çalıştır:** Sütun 6'daki komutu terminalde çalıştır, beklenen sonucu gör (örn. `pnpm test streak` -> ilgili testler yeşil).
3. **Tüm kaliteyi çalıştır:** `pnpm test` (hepsi yeşil), `pnpm lint`, `pnpm typecheck` (hata yok).
4. **Güvenlik kontrol listesi (kısa):**
  - **Sır sızıntısı yok:** `.env`, servis hesabı JSON'ları, özel anahtarlar repoda olmamalı. Kontrol: `git status` ve `git ls-files` çıktısında `.env`, `*-service-account*.json`, `GoogleService-Info.plist` (gerekiyorsa) görünmemeli; `.gitignore`'da olmalı.
  - **Bağımlılık denetimi:** `pnpm audit` -> kritik/yüksek açık çıkarsa bana bildir.
  - **Yetki/kapsam:** Yeni bir izin (kamera, bildirim, vb.) ya da dış erişim eklendiyse "neden gerekli?" diye sor.
5. **Güvenlik-kritik adımlarda derin tarama:** Aşağıdaki "Güvenlik-Kritik Adımlar" listesindeki ID'lerde, bana **"bu değişikliği Security Review ve Bugbot ile tara"** de; ben security-review ve bugbot incelemesini çalıştırıp bulguları sana özetleyeyim. (Cursor'daki Bugbot/Security-Review araçlarıyla.)
6. **Onayla & işaretle:** Her şey iyiyse sütun 2'de `[x]` yap; commit'i sen at ya da bana attır.

**Faz sonunda (PR'da):** Merge etmeden önce mutlaka bana **"PR'ı Bugbot + Security Review ile incele"** de. Ben tüm faz değişikliğini tarayıp güvenlik/regresyon bulgularını raporlayayım; temizse merge.

### Neyin "sır" olup olmadığı (kafa karışıklığını önlemek için)

- **Sır DEĞİL (repoda olabilir / public):** RevenueCat **public SDK key**, AdMob **App ID / Ad Unit ID**, Firebase istemci config (apiKey vb. - bunlar istemci tanımlayıcısıdır, App Check ile korunur).
- **SIR (asla commit etme):** Gemini API anahtarı (zaten **Firebase AI Logic** ile Google'da kalır, bizde olmayacak), Firebase **service-account** JSON'u, App Store/Play imzalama anahtarları & API key'leri (EAS'te yönetilir), `.env` içindeki her şey.
- **Altın kural:** Anahtar/secret üretimi gerektiren her adımda ben sana "bunu `.env`/EAS Secret olarak gir, repoya koyma" diye açıkça hatırlatacağım.

### Güvenlik-Kritik Adımlar (derin tarama önerilen ID'ler)

T-012, T-015, T-016, T-057, T-058, T-060, T-069, T-070, T-071, T-072, T-077, T-106, T-116, T-117, T-129, T-132, T-139, T-141, T-157, T-158, T-159, T-160, T-165.

---

## FAZ 0 - Tracer Bullet 0: Yürüyen İskelet (uçtan uca boru hattı)

> Hedef: Boş ama **uçtan uca çalışan** bir uygulama: UI -> use-case -> SQLite adapter -> geri UI; testler, lint, CI yeşil. **Android yerel** (`expo start --android`); **iOS bulut build** yalnız EAS ile (Mac gerekmez).


| ID    | ✓   | Commit Mesajı                                  | Adım                                                                                                       | Neden                                           | Onay (Doğrulama)                                                                                           |
| ----- | --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| T-001 | [✓] | chore: bootstrap expo sdk 56 typescript app    | `pnpm create expo-app` ile SDK 56 + TypeScript şablonu oluştur (pnpm `nodeLinker: hoisted` otomatik gelir) | Projenin temel iskeleti                         | `pnpm expo start` ile uygulama Android'de açılıyor; `pnpm-workspace.yaml` içinde `nodeLinker: hoisted` var |
| T-002 | [✓] | chore: init git and gitignore                  | Git init + Expo/Node `.gitignore` + ilk commit                                                             | Sürüm kontrolü + sır sızıntısını baştan engelle | `git status` temiz; `node_modules`, `.env` ignore'da                                                       |
| T-003 | [✓] | build: enable typescript strict mode           | `tsconfig.json` strict + path alias hazırlığı                                                              | Tam tip güvenliği (PRD)                         | `pnpm typecheck` hatasız                                                                                   |
| T-004 | [✓] | build: add eslint and prettier                 | ESLint + Prettier kur/yapılandır                                                                           | Tutarlı, temiz kod                              | `pnpm lint` çalışıyor, hata yok                                                                            |
| T-005 | [✓] | test: setup jest and rntl                      | Jest + RNTL kurulum + örnek 1 test                                                                         | TDD altyapısı                                   | `pnpm test` 1 örnek test yeşil                                                                             |
| T-006 | [✓] | ci: add github actions for lint typecheck test | GitHub Actions: push'ta lint+typecheck+test                                                                | Her adımı otomatik doğrula                      | Actions çalışıp yeşil (örnek push)                                                                         |
| T-007 | [✓] | chore: scaffold hexagonal folders              | `src/domain, application, infrastructure, presentation` + index                                            | SOLID/hexagonal sınırlar (PRD §9)               | Klasörler var; import alias çözülüyor                                                                      |
| T-008 | [✓] | build: configure path aliases                  | `@/` alias (tsconfig + babel + jest)                                                                       | Temiz import                                    | `@/...` import edilen örnek dosya derleniyor                                                               |
| T-009 | [✓] | feat: setup nativewind and tailwind config     | NativeWind + tailwind.config (renk token iskeleti)                                                         | Tasarım sistemi temeli                          | Bir ekranda Tailwind class render oluyor                                                                   |
| T-010 | [✓] | feat: add base theme tokens light dark         | Fildişi light + sıcak dark token iskeleti                                                                  | PRD §11 tema temeli                             | İki temada arka plan rengi değişiyor (manuel)                                                              |
| T-011 | [✓] | feat: base expo router layout                  | `app/_layout.tsx` + `index.tsx`                                                                            | Yönlendirme temeli                              | Ana ekran açılıyor                                                                                         |
| T-012 | [✓] | build: init eas json profiles                  | `eas.json` dev/preview/prod profilleri                                                                     | Bulut build/dağıtım (Windows'tan iOS)           | `eas.json` geçerli; `eas build:configure` ok                                                               |
| T-013 | [~] | build: verify local android dev run            | **Android: kısmen tamam** — `expo prebuild` + `pnpm android` (dev client). iOS EAS hâlâ Apple Developer ($99) bekliyor | Android-öncelikli geliştirme (PRD §8)           | Android dev build açılıyor; iOS T-014 için erteli                                                              |
| T-014 | [—] | build: verify eas ios cloud build              | **ERTELENDİ** — Apple Developer Program ($99/yr) gerekli                                                   | iOS pipeline kanıtı (PRD §8)                    | iOS build EAS'te yeşil; IPA/TestFlight'a hazır                                                             |
| T-015 | [✓] | build: env and config management               | `app.config.ts` + env yönetimi (sırlar EAS Secret/.env)                                                    | Sırları koddan ayır                             | `.env` ignore'da; config tipli okunuyor                                                                    |
| T-016 | [✓] | build: drizzle and expo-sqlite setup           | Drizzle + expo-sqlite + metro `.sql` + drizzle.config                                                      | Local-first DB altyapısı                        | `drizzle-kit generate` migration üretiyor                                                                  |
| T-017 | [✓] | feat: sqliteprovider and migrations runner     | Root'ta SQLiteProvider + `useMigrations`                                                                   | DB başlatma                                     | Uygulama açılışta migration'ı uyguluyor (log)                                                              |
| T-018 | [✓] | test: healthcheck usecase red                  | (Red) HealthCheck use-case testi (saf)                                                                     | Tracer: domain katmanı kanıtı                   | Test **kırmızı** (henüz kod yok)                                                                           |
| T-019 | [✓] | feat: healthcheck usecase green                | (Green) HealthCheck use-case implementasyonu                                                               | Domain çalışır                                  | T-018 testi yeşil                                                                                          |
| T-020 | [✓] | test: drizzle health adapter red               | (Red) DB health adapter testi (test DB)                                                                    | Adapter katmanı kanıtı                          | Test kırmızı                                                                                               |
| T-021 | [✓] | feat: drizzle health adapter green             | (Green) SQLite health adapter                                                                              | DB okuma/yazma kanıtı                           | T-020 testi yeşil                                                                                          |
| T-022 | [✓] | feat: wire home to healthcheck                 | UI -> hook -> use-case -> adapter "DB OK" göster                                                           | Uçtan uca tracer tamam                          | Ana ekranda "DB OK" görünüyor (component test)                                                             |
| T-023 | [✓] | test: e2e app launch shows db ok               | Maestro: uygulama açılır, "DB OK" görülür                                                                  | E2E pipeline kanıtı                             | `maestro test` akışı yeşil                                                                                 |


---

## FAZ 1 - Tracer Bullet 1: Local-First Alışkanlık Takibi

> Hedef: Kullanıcı alışkanlık ekleyip "Yaptım" diyebiliyor; veriler cihazda kalıcı; dashboard 7 günü gösteriyor.


| ID    | ✓   | Commit Mesajı                              | Adım                                                              | Neden                                | Onay (Doğrulama)                              |
| ----- | --- | ------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| T-024 | [✓] | test: habit entity rules red               | (Red) Habit entity oluşturma/validasyon testleri                  | Çekirdek iş kuralı                   | Test kırmızı                                  |
| T-025 | [✓] | feat: habit entity green                   | (Green) Habit entity                                              | Domain modeli                        | T-024 yeşil                                   |
| T-026 | [✓] | test: habitlog entity and status red       | (Red) HabitLog + status (success/rescued/failed) testleri         | Günlük takip kuralı                  | Test kırmızı                                  |
| T-027 | [✓] | feat: habitlog entity green                | (Green) HabitLog entity                                           | Domain modeli                        | T-026 yeşil                                   |
| T-028 | [✓] | test: streak calculator cases red          | (Red) Streak hesabı (yeşil/sarı korur, kırmızı kırar) tüm vakalar | Sarı-kurtarma mantığı (PRD çekirdek) | Test kırmızı                                  |
| T-029 | [✓] | feat: streak calculator green              | (Green) Streak hesaplayıcı                                        | Çekirdek davranış                    | T-028 yeşil (tüm kenar vakalar)               |
| T-030 | [✓] | feat: define habit repository port         | `HabitRepository` interface + tipler                              | Bağımlılık tersleme                  | Tip derleniyor; mock yazılabiliyor            |
| T-031 | [✓] | feat: define habitlog repository port      | `HabitLogRepository` interface                                    | DI sınırı                            | Tip derleniyor                                |
| T-032 | [✓] | test: habits schema migration red          | (Red) habits tablosu şema/migration testi                         | Şema doğruluğu                       | Test kırmızı                                  |
| T-033 | [✓] | feat: habits schema and migration green    | (Green) habits şeması + migration                                 | Kalıcı depolama                      | T-032 yeşil                                   |
| T-034 | [✓] | test: drizzle habit repo crud red          | (Red) DrizzleHabitRepository CRUD testleri                        | Adapter doğruluğu                    | Test kırmızı                                  |
| T-035 | [✓] | feat: drizzle habit repo green             | (Green) DrizzleHabitRepository                                    | Veri erişimi                         | T-034 yeşil                                   |
| T-036 | [✓] | test: habit_logs schema and repo red       | (Red) habit_logs şema + repo testleri                             | Log kalıcılığı                       | Test kırmızı                                  |
| T-037 | [✓] | feat: habit_logs schema and repo green     | (Green) habit_logs şema + repo                                    | Veri erişimi                         | T-036 yeşil                                   |
| T-038 | [✓] | test: create habit usecase red             | (Red) CreateHabitUseCase testi (mock repo)                        | Uygulama mantığı                     | Test kırmızı                                  |
| T-039 | [✓] | feat: create habit usecase green           | (Green) CreateHabitUseCase                                        | Alışkanlık ekleme                    | T-038 yeşil                                   |
| T-040 | [✓] | test: log habit usecase red                | (Red) LogHabitUseCase (success) testi                             | "Yaptım" mantığı                     | Test kırmızı                                  |
| T-041 | [✓] | feat: log habit usecase green              | (Green) LogHabitUseCase                                           | Günü işaretleme                      | T-040 yeşil                                   |
| T-042 | [✓] | test: get dashboard usecase red            | (Red) GetDashboardUseCase (habit'ler + son 7 gün) testi           | Dashboard verisi                     | Test kırmızı                                  |
| T-043 | [✓] | feat: get dashboard usecase green          | (Green) GetDashboardUseCase                                       | Anasayfa beslemesi                   | T-042 yeşil                                   |
| T-044 | [✓] | feat: di container and providers           | Use-case'leri adapter'lara bağlayan DI/provider                   | Sunum-altyapı bağı                   | Hook gerçek use-case alıyor                   |
| T-045 | [✓] | test: usehabits hook red                   | (Red) useHabits hook testi (mock)                                 | UI veri akışı                        | Test kırmızı                                  |
| T-046 | [✓] | feat: usehabits hook green                 | (Green) useHabits hook                                            | Reaktif veri                         | T-045 yeşil (live query)                      |
| T-047 | [✓] | test: habitcard component red              | (Red) HabitCard (7 gün halkaları) testi                           | Görsel bileşen                       | Test kırmızı                                  |
| T-048 | [✓] | feat: habitcard component green            | (Green) HabitCard                                                 | Dashboard kartı                      | T-047 yeşil                                   |
| T-049 | [✓] | test: dashboard screen and empty state red | (Red) Dashboard + boş durum testi                                 | Ana ekran                            | Test kırmızı                                  |
| T-050 | [✓] | feat: dashboard screen green               | (Green) Dashboard ekranı (liste + boş durum)                      | Anasayfa                             | T-049 yeşil                                   |
| T-051 | [✓] | test: add habit form red                   | (Red) Alışkanlık ekleme formu davranış testi                      | Girdi doğrulama                      | Test kırmızı                                  |
| T-052 | [✓] | feat: add habit form green                 | (Green) Alışkanlık ekleme formu + validasyon                      | Habit oluşturma UI                   | T-051 yeşil                                   |
| T-053 | [✓] | feat: mark done action and celebration     | "Yaptım" -> LogHabitUseCase + kutlama animasyonu                  | Pozitif pekiştirme                   | Dokununca gün yeşile dönüyor (component test) |
| T-054 | [✓] | test: e2e add habit mark done persists     | Maestro: habit ekle, işaretle, yeniden aç, kalıcı                 | Tracer Bullet 1 kanıtı               | E2E akış yeşil                                |


---

## FAZ 2 - Tracer Bullet 2: Çekirdek Değer - Bahane Sohbeti & AI

> Hedef: "Yapamadım" -> bahane yaz -> AI (Gemini) mikro-görev üretir -> "kurtardım" -> gün sarı. Güvenli proxy + guardrail + kota.


| ID    | ✓   | Commit Mesajı                             | Adım                                                                                | Neden                                      | Onay (Doğrulama)                              |
| ----- | --- | ----------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| T-055 | [✓] | chore: create firebase project and apps   | Firebase projesi + iOS/Android app kaydı                                            | AI proxy altyapısı (PRD §8)                | Konsolda app'ler görünüyor                    |
| T-056 | [✓] | build: install rn-firebase app and init   | `@react-native-firebase/app` + config plugin + init                                 | Firebase temeli                            | Uygulama Firebase'e bağlanıyor (log)          |
| T-057 | [✓] | build: setup app check debug provider     | App Check (debug provider dev'de)                                                   | Abuse koruması temeli                      | App Check token üretiliyor (dev)              |
| T-058 | [✓] | build: install firebase ai logic          | `@react-native-firebase/ai` kurulum                                                 | Gemini erişimi                             | Paket import ediliyor, derleniyor             |
| T-059 | [✓] | feat: define ai coach port                | `AiCoachPort` interface (girdi bağlam, çıktı yapısal)                               | DI/test edilebilirlik                      | Mock AiCoach yazılabiliyor                    |
| T-060 | [✓] | test: barrier response schema red         | (Red) BarrierResponse zod şema testi                                                | Yapısal çıktı kalkanı                      | Test kırmızı                                  |
| T-061 | [✓] | feat: barrier response schema green       | (Green) BarrierResponse tip + zod                                                   | Tip güvenli AI çıktısı                     | T-060 yeşil                                   |
| T-062 | [✓] | test: prompt builder lenses red           | (Red) Mercek+profil+habit -> prompt (saf fonksiyon) testi                           | Mercek mantığı                             | Test kırmızı                                  |
| T-063 | [✓] | feat: prompt builder green                | (Green) 3 mercek için prompt builder                                                | Kişiselleştirme                            | T-062 yeşil                                   |
| T-064 | [✓] | test: preclassifier logic red             | (Red) Konu-içi/dışı ön-sınıflandırıcı testi (mock)                                  | Kötüye kullanım+maliyet kalkanı (PRD §6.4) | Test kırmızı                                  |
| T-065 | [✓] | feat: preclassifier green                 | (Green) Ön-sınıflandırıcı (Flash-Lite)                                              | Konu-dışını ucuza ele                      | T-064 yeşil                                   |
| T-066 | [✓] | test: crisis guardrail red                | (Red) Kriz tespiti -> koçluk yok, kaynak göster testi                               | Etik+store güvenliği                       | Test kırmızı                                  |
| T-067 | [✓] | feat: crisis guardrail green              | (Green) Kriz tespiti + güvenli kaynak yanıtı                                        | Kullanıcı güvenliği                        | T-066 yeşil                                   |
| T-068 | [✓] | test: firebase ai adapter mocked red      | (Red) FirebaseAiCoach adapter testi (Gemini mock, parse+hata)                       | Adapter doğruluğu                          | Test kırmızı                                  |
| T-069 | [✓] | feat: firebase ai adapter green           | (Green) FirebaseAiCoach (Gemini 3 Flash, JSON schema, maxOutput limit)              | Güvenli AI çağrısı                         | T-068 yeşil                                   |
| T-070 | [✓] | test: islamic content policy red          | (Red) Manevi mod sadece Kur'an/Sünnet/Sünnetullah + uydurma-alıntı kaçınma testi    | Dini hassasiyet (PRD §6.5)                 | Test kırmızı (prompt kuralları doğrulanır)    |
| T-071 | [✓] | feat: islamic content policy green        | (Green) İçerik politikası prompt katmanı                                            | Hallüsinasyon önlemi                       | T-070 yeşil                                   |
| T-072 | [✓] | test: ai_usage quota schema and logic red | (Red) ai_usage şema + haftalık 3 kota mantığı testi                                 | Maliyet/kota kontrolü                      | Test kırmızı                                  |
| T-073 | [✓] | feat: ai_usage quota green                | (Green) ai_usage şema/migration + kota use-case                                     | Free 3/hafta sınırı                        | T-072 yeşil                                   |
| T-074 | [✓] | test: bust excuse chat usecase red        | (Red) BustExcuseChatUseCase (mock AiCoach) testi                                    | Çekirdek akış                              | Test kırmızı                                  |
| T-075 | [✓] | feat: bust excuse chat usecase green      | (Green) BustExcuseChatUseCase (bağlam birleştirme)                                  | Bahane -> mikro-görev                      | T-074 yeşil                                   |
| T-076 | [✓] | test: rescue streak usecase red           | (Red) RescueStreakUseCase (sarı, zincir korunur) testi                              | Sarı-kurtarma değeri                       | Test kırmızı                                  |
| T-077 | [✓] | feat: rescue streak usecase green         | (Green) RescueStreakUseCase                                                         | Zinciri kurtarma                           | T-076 yeşil                                   |
| T-078 | [✓] | test: chatbubble component red            | (Red) ChatBubble (user/assistant + bookmark/regenerate buton) testi                 | Sohbet UI                                  | Test kırmızı                                  |
| T-079 | [✓] | feat: chatbubble component green          | (Green) ChatBubble                                                                  | Mesaj gösterimi                            | T-078 yeşil                                   |
| T-080 | [✓] | test: excuse chat screen red              | (Red) Bahane sohbet ekranı (girdi/gönder/yükleniyor/yanıt) testi                    | Çekirdek ekran                             | Test kırmızı                                  |
| T-081 | [✓] | feat: excuse chat screen green            | (Green) Bahane sohbet ekranı + streaming                                            | Sohbet deneyimi                            | T-080 yeşil                                   |
| T-082 | [✓] | feat: microtask card and rescue wiring    | MicroTaskCard + "yaptım/vazgeçtim" -> rescue/fail                                   | Akışı kapat                                | Sarı/kırmızı doğru işleniyor (component test) |
| T-083 | [✓] | feat: device tts read aloud               | `expo-speech` ile koç cevabını sesli okuma                                          | UX (PRD §5/Soru 3)                         | Cevap sesli okunuyor (manuel)                 |
| T-084 | [✓] | test: e2e excuse to rescue flow           | Maestro: "Yapamadım" -> bahane -> mikro-görev -> kurtar -> sarı (AI mock/test mode) | Tracer Bullet 2 kanıtı                     | E2E akış yeşil                                |


---

## FAZ 3 - Tracer Bullet 3: Onboarding, Mercek, Profil, i18n, Tasarım

> Hedef: İlk açılışta mercek+profil alınır, profil AI'a bağlanır; 5 dil UI + tema + liquid-glass çalışır.


| ID    | ✓   | Commit Mesajı                               | Adım                                                                   | Neden                       | Onay (Doğrulama)                           |
| ----- | --- | ------------------------------------------- | ---------------------------------------------------------------------- | --------------------------- | ------------------------------------------ |
| T-085 | [✓] | test: i18n lookup and fallback red          | (Red) i18n anahtar/fallback testi                                      | Çok dillilik temeli         | Test kırmızı                               |
| T-086 | [✓] | feat: i18n setup en tr green                | (Green) react-i18next + expo-localization (en, tr)                     | UI çevirisi                 | T-085 yeşil; dil değişince metin değişiyor |
| T-087 | [✓] | feat: add locales ar ja fr scaffolding      | ar/ja/fr çeviri dosyaları + Arapça metin yönü                          | 5 dil lansman (12'ye hazır) | 5 dilde UI render; ar düzeni doğru         |
| T-088 | [✓] | test: theme provider selection red          | (Red) auto/light/dark seçim mantığı testi                              | Tema sistemi                | Test kırmızı                               |
| T-089 | [✓] | feat: theme provider green                  | (Green) Tema provider + token + NativeWind dark                        | Fildişi/dark (PRD §11)      | T-088 yeşil; tema değişiyor                |
| T-090 | [✓] | test: glasscard fallback red                | (Red) GlassCard (BlurView + reduce-transparency fallback) testi        | Liquid-glass tutarlılığı    | Test kırmızı                               |
| T-091 | [✓] | feat: glasscard green                       | (Green) GlassCard (expo-blur) + iOS26 glass-effect guard'lı            | Premium görünüm (Soru 7/13) | T-090 yeşil; tüm cihazda cam               |
| T-092 | [✓] | test: user_profile entity and repo red      | (Red) user_profile entity + repo testi                                 | Kişiselleştirme verisi      | Test kırmızı                               |
| T-093 | [✓] | feat: user_profile green                    | (Green) user_profile şema/migration + repo                             | Profil saklama              | T-092 yeşil                                |
| T-094 | [✓] | test: save onboarding usecase red           | (Red) SaveOnboardingUseCase (mercek/kimlik/ton/bariyer/bildirim) testi | Onboarding mantığı          | Test kırmızı                               |
| T-095 | [✓] | feat: save onboarding usecase green         | (Green) SaveOnboardingUseCase                                          | Profil kaydı                | T-094 yeşil                                |
| T-096 | [✓] | test: approach selector red                 | (Red) ApproachSelector (önizleme kartları) testi                       | Mercek seçimi (Soru 1)      | Test kırmızı                               |
| T-097 | [✓] | feat: approach selector green               | (Green) ApproachSelector bileşeni                                      | Kimlik değil ton tercihi    | T-096 yeşil                                |
| T-098 | [✓] | feat: onboarding flow screens               | Çok adımlı onboarding ekranları (PRD §5.A)                             | İlk deneyim                 | Akış baştan sona geziliyor                 |
| T-099 | [✓] | test: onboarding navigation state red+green | Onboarding navigasyon/state testi + implementasyon                     | Akış sağlamlığı             | Test yeşil; tamamlanınca dashboard         |
| T-100 | [✓] | test: profile injected to prompt red+green  | Profilin prompt builder'a enjeksiyonu testi + kod                      | Çıktı kalitesi (Soru 7)     | Test yeşil; prompt profili içeriyor        |
| T-101 | [✓] | feat: e2e onboarding to dashboard           | Maestro: onboarding tamamla -> ilk habit ile dashboard                 | Tracer Bullet 3 kanıtı      | E2E akış yeşil                             |


---

## FAZ 4 - Tracer Bullet 4: Hesap, Bookmark, Sohbet Geçmişi, Sync

> Hedef: Misafir/hesap girişi; AI cevaplarını bookmark/regenerate; sohbet geçmişi; Firestore sync.


| ID    | ✓   | Commit Mesajı                         | Adım                                                        | Neden                          | Onay (Doğrulama)                                 |
| ----- | --- | ------------------------------------- | ----------------------------------------------------------- | ------------------------------ | ------------------------------------------------ |
| T-102 | [✓] | feat: define auth sync bookmark ports | `AuthPort`, `SyncPort`, `BookmarkRepository` interface'leri | DI sınırları                   | Mock'lar yazılabiliyor                           |
| T-103 | [✓] | test: auth usecases red               | (Red) sign-in/guest/sign-out use-case testleri (mock)       | Hesap mantığı                  | Test kırmızı                                     |
| T-104 | [✓] | feat: firebase auth adapter green     | (Green) Firebase Auth (Apple/Google/e-posta + anonim)       | Hesap sistemi (Soru 9)         | T-103 yeşil                                      |
| T-105 | [✓] | feat: auth ui and guest continue      | Giriş ekranları + "misafir devam et"                        | Sürtünmesiz başlangıç          | Misafir ve girişli akış çalışıyor                |
| T-106 | [✓] | test: bookmark usecase red            | (Red) BookmarkUseCase (ekle/sil/listele) testi              | Kaydetme mantığı               | Test kırmızı                                     |
| T-107 | [✓] | feat: bookmarks schema and repo green | (Green) bookmarks şema/migration + repo (yerel)             | Bookmark saklama               | T-106 yeşil                                      |
| T-108 | [✓] | feat: bookmark and regenerate wiring  | ChatBubble'da bookmark + yeniden üret aksiyonları           | Soru 9 değeri                  | Buton çalışıyor (component test)                 |
| T-109 | [✓] | test: chat history repo red           | (Red) chat_messages şema + repo testi                       | Geçmiş saklama                 | Test kırmızı                                     |
| T-110 | [✓] | feat: chat history repo green         | (Green) chat_messages şema + repo + kalıcılık               | Sohbet geçmişi                 | T-109 yeşil                                      |
| T-111 | [✓] | test: saved screen red                | (Red) Kaydedilenler ekranı testi                            | Bookmark erişimi               | Test kırmızı                                     |
| T-112 | [✓] | feat: saved screen green              | (Green) Kaydedilenler ekranı                                | "Gününü kurtaran" cevaba dönüş | T-111 yeşil                                      |
| T-113 | [✓] | test: firestore sync adapter red      | (Red) FirestoreSync (push/pull, mock) testi                 | Cihazlar arası sync            | Test kırmızı                                     |
| T-114 | [✓] | feat: firestore sync green            | (Green) FirestoreSync + basit çakışma (last-write-wins)     | Veri taşınabilirliği           | T-113 yeşil                                      |
| T-115 | [✓] | feat: firestore security rules        | Deny-by-default + kullanıcıya-özel kapsam kuralları         | Veri güvenliği (kritik)        | Emülatörde başka kullanıcı verisine erişim reddi |
| T-116 | [✓] | feat: sync on login                   | Girişte sync tetikleme                                      | Kesintisiz deneyim             | Girişte bookmark'lar çekiliyor                   |
| T-117 | [✓] | feat: e2e signin bookmark persists    | Maestro: giriş -> bookmark -> yeniden aç -> kalıcı          | Tracer Bullet 4 kanıtı         | E2E akış yeşil                                   |


---

## FAZ 5 - Tracer Bullet 5: Bildirimler (geri-getirme motoru)

> Hedef: Kullanıcının seçtiği saat/sıklıkta yoklama + streak-risk bildirimleri; bildirimden tek dokunuş sohbete.


| ID    | ✓   | Commit Mesajı                               | Adım                                                      | Neden                    | Onay (Doğrulama)                      |
| ----- | --- | ------------------------------------------- | --------------------------------------------------------- | ------------------------ | ------------------------------------- |
| T-118 | [ ] | feat: define notification port              | `NotificationPort` interface                              | DI sınırı                | Mock yazılabiliyor                    |
| T-119 | [ ] | test: schedule logic red                    | (Red) Profil tercihleri -> bildirim zamanları (saf) testi | Yoklama mantığı (Soru 2) | Test kırmızı                          |
| T-120 | [ ] | feat: schedule logic green                  | (Green) Zamanlama mantığı                                 | Doğru saatlerde yoklama  | T-119 yeşil                           |
| T-121 | [ ] | feat: expo-notifications adapter            | İzin + zamanla + iptal (expo-notifications)               | Yerel bildirim           | İzin alınıp bildirim zamanlanıyor     |
| T-122 | [ ] | feat: schedule on habit create update       | Habit oluştur/güncellede hatırlatma kur                   | Tutunma                  | Habit kurunca bildirim planlanıyor    |
| T-123 | [ ] | test: notification deeplink red+green       | Bildirimden sohbete derin-link testi + kod                | Geri-getirme (Soru 5)    | Test yeşil; dokununca sohbet açılıyor |
| T-124 | [ ] | feat: streak risk and checkin notifications | Streak-risk + "ne durumdasın?" yoklaması                  | Retention                | Gün sonu uyarısı geliyor (manuel)     |
| T-125 | [ ] | feat: e2e notification opens chat           | Manuel/E2E: zamanlanan bildirime dokun -> sohbet          | Tracer Bullet 5 kanıtı   | Akış doğrulanıyor                     |


---

## FAZ 6 - Tracer Bullet 6: Monetizasyon (Abonelik + Paywall + Ödüllü Reklam)

> Hedef: RevenueCat abonelik, onboarding-sonu soft paywall, kota duvarı, ödüllü reklamla +1.


| ID    | ✓   | Commit Mesajı                           | Adım                                                                | Neden                         | Onay (Doğrulama)                              |
| ----- | --- | --------------------------------------- | ------------------------------------------------------------------- | ----------------------------- | --------------------------------------------- |
| T-126 | [ ] | feat: define subscription and ads ports | `SubscriptionPort` + `AdsPort` interface'leri                       | DI/test edilebilirlik         | Mock'lar yazılabiliyor                        |
| T-127 | [ ] | chore: revenuecat products setup        | RevenueCat + store ürünleri (aylık/yıllık + trial)                  | Abonelik altyapısı            | Offerings konsolda görünüyor                  |
| T-128 | [ ] | build: install react-native-purchases   | RevenueCat SDK + config plugin                                      | Satın alma                    | Dev build'de SDK init oluyor                  |
| T-129 | [ ] | test: entitlement logic red             | (Red) Abonelik/entitlement use-case testi (mock)                    | Premium kapısı                | Test kırmızı                                  |
| T-130 | [ ] | feat: revenuecat adapter green          | (Green) RevenueCat adapter (offerings/purchase/restore/entitlement) | Abonelik                      | T-129 yeşil                                   |
| T-131 | [ ] | test: premium gating red                | (Red) Free 3/hafta vs premium (adil-kullanım tavanı) testi          | Kota+abuse                    | Test kırmızı                                  |
| T-132 | [ ] | feat: gating in chat usecase green      | (Green) BustExcuseChatUseCase'e kapı entegrasyonu                   | Gelir + maliyet kontrolü      | T-131 yeşil                                   |
| T-133 | [ ] | test: paywall sheet red                 | (Red) PaywallSheet (aylık/yıllık/trial) testi (mock)                | Satış ekranı                  | Test kırmızı                                  |
| T-134 | [ ] | feat: paywall sheet green               | (Green) PaywallSheet (bölgesel fiyat RC)                            | Dönüşüm                       | T-133 yeşil                                   |
| T-135 | [ ] | feat: soft paywall after onboarding     | Onboarding sonu soft paywall + "ücretsiz devam et"                  | Yüksek gelir noktası (Soru 4) | Onboarding sonrası paywall + atlama çalışıyor |
| T-136 | [ ] | feat: quota wall paywall trigger        | Kota dolunca paywall tetikleme                                      | Dönüşüm anı                   | Kota bitince paywall açılıyor                 |
| T-137 | [ ] | build: install admob and ump consent    | `react-native-google-mobile-ads` + UMP/ATT izin akışı               | Reklam + uyum                 | İzin akışı reklamdan önce çalışıyor           |
| T-138 | [ ] | test: rewarded ad reward red            | (Red) Ödüllü reklam -> +1 kota mantığı (mock) testi                 | Free mekaniği (Soru 3)        | Test kırmızı                                  |
| T-139 | [ ] | feat: rewarded ad adapter green         | (Green) AdMob ödüllü adapter                                        | Gelir + maliyet dengesi       | T-138 yeşil                                   |
| T-140 | [ ] | feat: gentle ad offer at quota wall     | Kota duvarında nazik "reklam izle = +1" (hassas-an inceliği)        | Marka koruma (PRD §12)        | Reklam izleyince +1 kota                      |
| T-141 | [ ] | feat: e2e quota upgrade or ad           | Maestro: kota bitti -> yükselt/reklam -> +1                         | Tracer Bullet 6 kanıtı        | E2E akış yeşil                                |


---

## FAZ 7 - Tracer Bullet 7: Cila, Sükunet, Erişilebilirlik, Analitik

> Hedef: Yayınlanabilir kalite: nefes ekranı, export/sil, analytics/crash, review istemi, erişilebilirlik, Remote Config.


| ID    | ✓   | Commit Mesajı                       | Adım                                                     | Neden                      | Onay (Doğrulama)                       |
| ----- | --- | ----------------------------------- | -------------------------------------------------------- | -------------------------- | -------------------------------------- |
| T-142 | [ ] | test: breathing logic red+green     | Nefes egzersizi faz/zamanlama mantığı testi + kod        | Sükunet Odası (Soru 8)     | Test yeşil                             |
| T-143 | [ ] | feat: breathing room ui             | BreathingOrb animasyon ekranı (sessiz)                   | Sükunet                    | Ekran çalışıyor (manuel)               |
| T-144 | [ ] | test: data export usecase red+green | JSON export use-case testi + kod                         | Local-first güven          | Test yeşil; geçerli JSON üretiliyor    |
| T-145 | [ ] | test: data delete reset red+green   | Veri silme/sıfırlama testi + kod                         | Gizlilik/uyum              | Test yeşil; veri siliniyor             |
| T-146 | [ ] | feat: analytics adapter events      | Firebase Analytics (gizlilik dostu) olayları             | KPI ölçümü (PRD §18)       | Olaylar konsolda görünüyor             |
| T-147 | [ ] | feat: crashlytics integration       | Crashlytics                                              | Stabilite izleme           | Test crash raporlanıyor                |
| T-148 | [ ] | feat: remote config integration     | Remote Config (model/limit/kota/flag) okuma              | Uzaktan ayar/A-B (Soru 16) | Değer değişince uygulama uyum sağlıyor |
| T-149 | [ ] | feat: in-app review prompt          | İlk "kurtarma" sonrası review istemi                     | ASO/yorum (PRD §14)        | İstem doğru anda tetikleniyor          |
| T-150 | [ ] | feat: accessibility pass            | Etiketler, dinamik font, kontrast, dokunma hedefi        | Erişilebilirlik (PRD §11)  | Ekran okuyucu temel akışı geçiyor      |
| T-151 | [ ] | feat: error empty loading states    | Tüm ekranlarda hata/boş/yükleniyor cilası                | Sağlamlık                  | Kenar durumlar düzgün                  |
| T-152 | [ ] | feat: settings screen complete      | Ayarlar (mercek/dil/tema/bildirim/hesap/export/gizlilik) | Kontrol merkezi            | Tüm ayarlar çalışıyor                  |
| T-153 | [ ] | test: e2e full regression           | Maestro: uçtan uca mutlu yol regresyon paketi            | Tracer Bullet 7 kanıtı     | Tüm E2E akışlar yeşil                  |


---

## FAZ 8 - Tracer Bullet 8: Lansman Hazırlığı & Yayın

> Hedef: Mağaza varlıkları, uyum, kapalı beta (≥20 testçi/14 gün), güvenlik denetimi, global eş zamanlı çıkış.


| ID    | ✓   | Commit Mesajı                              | Adım                                                            | Neden                    | Onay (Doğrulama)                      |
| ----- | --- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------ | ------------------------------------- |
| T-154 | [ ] | chore: app icon and splash                 | İkon + splash (tüm boyutlar)                                    | Marka                    | Build'de doğru görünüyor              |
| T-155 | [ ] | docs: store assets screenshots 5 langs     | 5 dilde ekran görüntüsü + keyword'lü altyazı                    | ASO/OCR (PRD §14)        | 5 dil seti hazır                      |
| T-156 | [ ] | docs: aso metadata per locale              | Başlık/alt başlık/keyword (dile özel araştırma)                 | Organik büyüme           | Metadata 5 dilde hazır                |
| T-157 | [ ] | docs: privacy policy terms disclaimers     | Gizlilik/şartlar + sağlık/dini disclaimer sayfaları             | Yasal/uyum (PRD §15)     | Linkler erişilebilir                  |
| T-158 | [ ] | chore: privacy labels and data safety      | Apple Privacy Labels + Play Data Safety formları                | Store uyumu              | Formlar dolduruldu                    |
| T-159 | [ ] | chore: developer accounts setup            | Apple (99$/yıl) + Google (25$) hesapları                        | Yayın ön koşulu (Soru 5) | Hesaplar aktif                        |
| T-160 | [ ] | build: enable app check enforcement        | Üretimde App Check enforcement aç                               | AI proxy abuse koruması  | Enforcement açık; sahte istemci reddi |
| T-161 | [ ] | build: production eas build and signing    | Üretim EAS build + imzalama                                     | Yayın paketi             | Store-ready build üretildi            |
| T-162 | [ ] | chore: testflight and play closed testing  | TestFlight + Play closed (≥20 testçi, 14 gün)                   | Stabilizasyon (PRD §14)  | Beta dağıtıldı, geri bildirim akıyor  |
| T-163 | [ ] | fix: beta feedback crash fixes             | Beta bulgularını düzelt (iterasyon)                             | Kaliteli lansman         | Crash-free oranı yüksek               |
| T-164 | [ ] | docs: featuring nomination                 | Apple/Google featuring başvuruları                              | Bütçesiz görünürlük      | Başvurular gönderildi                 |
| T-165 | [ ] | chore: final security and dependency audit | Son güvenlik incelemesi + `pnpm audit` + Security Review/Bugbot | Güvenli yayın            | Kritik açık yok; rapor temiz          |
| T-166 | [ ] | release: global simultaneous launch        | EAS Submit ile 5 dilde global eş zamanlı yayın                  | Lansman ivmesi (PRD §14) | Uygulama her iki store'da canlı       |
| T-167 | [ ] | chore: post-launch monitoring              | Crash/KPI/maliyet izleme paneli                                 | Sürdürülebilirlik        | Metrikler izleniyor                   |


---

## Özet

- **8 Tracer Bullet fazı, 167 atomik adım.** Her faz uçtan uca çalışan bir dilim teslim eder.
- **TDD:** mantık adımları `test:` (Red) -> `feat:` (Green) çiftleri halinde; testi olmayan mantık yok.
- **Güvenlik:** her adımda yukarıdaki Review & Güvenlik Protokolü; kritik adımlarda Security Review + Bugbot taraması.
- Hazırsan **T-001**'den başlayalım; her adımda ne yaptığımı, hangi dosyaları değiştirdiğimi, doğrulama komutunu ve (gerekiyorsa) güvenlik notunu sana açıkça vereceğim.

İnşallah hayırlı olsun. Başlamak için onayını bekliyorum.