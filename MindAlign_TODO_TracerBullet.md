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

T-012, T-015, T-016, T-057, T-058, T-060, T-069, T-070, T-071, T-072, T-077, T-106, T-116, T-117, T-129, T-132, T-139, T-141, T-157, T-158, T-159, T-160, T-165, T-169, T-171, T-188, T-189, T-199, T-205, T-209, T-211, T-212, T-237, T-260, T-264, T-266.

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
| T-118 | [✓] | feat: define notification port              | `NotificationPort` interface                              | DI sınırı                | Mock yazılabiliyor                    |
| T-119 | [✓] | test: schedule logic red                    | (Red) Profil tercihleri -> bildirim zamanları (saf) testi | Yoklama mantığı (Soru 2) | Test kırmızı                          |
| T-120 | [✓] | feat: schedule logic green                  | (Green) Zamanlama mantığı                                 | Doğru saatlerde yoklama  | T-119 yeşil                           |
| T-121 | [✓] | feat: expo-notifications adapter            | İzin + zamanla + iptal (expo-notifications)               | Yerel bildirim           | İzin alınıp bildirim zamanlanıyor     |
| T-122 | [✓] | feat: schedule on habit create update       | Habit oluştur/güncellede hatırlatma kur                   | Tutunma                  | Habit kurunca bildirim planlanıyor    |
| T-123 | [✓] | test: notification deeplink red+green       | Bildirimden sohbete derin-link testi + kod                | Geri-getirme (Soru 5)    | Test yeşil; dokununca sohbet açılıyor |
| T-124 | [✓] | feat: streak risk and checkin notifications | Streak-risk + "ne durumdasın?" yoklaması                  | Retention                | Gün sonu uyarısı geliyor (manuel)     |
| T-125 | [✓] | feat: e2e notification opens chat           | Manuel/E2E: zamanlanan bildirime dokun -> sohbet          | Tracer Bullet 5 kanıtı   | Akış doğrulanıyor                     |


---

## FAZ 6 - Tracer Bullet 6: Monetizasyon (Abonelik + Paywall + Ödüllü Reklam)

> Hedef: RevenueCat abonelik, onboarding-sonu soft paywall, kota duvarı, ödüllü reklamla +1.


| ID    | ✓   | Commit Mesajı                           | Adım                                                                | Neden                         | Onay (Doğrulama)                              |
| ----- | --- | --------------------------------------- | ------------------------------------------------------------------- | ----------------------------- | --------------------------------------------- |
| T-126 | [✓] | feat: define subscription and ads ports | `SubscriptionPort` + `AdsPort` interface'leri                       | DI/test edilebilirlik         | Mock'lar yazılabiliyor                        |
| T-127 | [✓] | chore: revenuecat products setup        | RevenueCat + store ürünleri (aylık/yıllık + trial)                  | Abonelik altyapısı            | Offerings konsolda görünüyor                  |
| T-128 | [✓] | build: install react-native-purchases   | RevenueCat SDK + config plugin                                      | Satın alma                    | Dev build'de SDK init oluyor                  |
| T-129 | [✓] | test: entitlement logic red             | (Red) Abonelik/entitlement use-case testi (mock)                    | Premium kapısı                | Test kırmızı                                  |
| T-130 | [✓] | feat: revenuecat adapter green          | (Green) RevenueCat adapter (offerings/purchase/restore/entitlement) | Abonelik                      | T-129 yeşil                                   |
| T-131 | [✓] | test: premium gating red                | (Red) Free 3/hafta vs premium (adil-kullanım tavanı) testi          | Kota+abuse                    | Test kırmızı                                  |
| T-132 | [✓] | feat: gating in chat usecase green      | (Green) BustExcuseChatUseCase'e kapı entegrasyonu                   | Gelir + maliyet kontrolü      | T-131 yeşil                                   |
| T-133 | [✓] | test: paywall sheet red                 | (Red) PaywallSheet (aylık/yıllık/trial) testi (mock)                | Satış ekranı                  | Test kırmızı                                  |
| T-134 | [✓] | feat: paywall sheet green               | (Green) PaywallSheet (bölgesel fiyat RC)                            | Dönüşüm                       | T-133 yeşil                                   |
| T-135 | [✓] | feat: soft paywall after onboarding     | Onboarding sonu soft paywall + "ücretsiz devam et"                  | Yüksek gelir noktası (Soru 4) | Onboarding sonrası paywall + atlama çalışıyor |
| T-136 | [✓] | feat: quota wall paywall trigger        | Kota dolunca paywall tetikleme                                      | Dönüşüm anı                   | Kota bitince paywall açılıyor                 |
| T-137 | [✓] | build: install admob and ump consent    | `react-native-google-mobile-ads` + UMP/ATT izin akışı               | Reklam + uyum                 | İzin akışı reklamdan önce çalışıyor           |
| T-138 | [✓] | test: rewarded ad reward red            | (Red) Ödüllü reklam -> +1 kota mantığı (mock) testi                 | Free mekaniği (Soru 3)        | Test kırmızı                                  |
| T-139 | [✓] | feat: rewarded ad adapter green         | (Green) AdMob ödüllü adapter                                        | Gelir + maliyet dengesi       | T-138 yeşil                                   |
| T-140 | [✓] | feat: gentle ad offer at quota wall     | Kota duvarında nazik "reklam izle = +1" (hassas-an inceliği)        | Marka koruma (PRD §12)        | Reklam izleyince +1 kota                      |
| T-141 | [✓] | feat: e2e quota upgrade or ad           | Maestro: kota bitti -> yükselt/reklam -> +1                         | Tracer Bullet 6 kanıtı        | E2E akış yeşil                                |


---

## FAZ 7 - Tracer Bullet 7: Cila, Sükunet, Erişilebilirlik, Analitik

> Hedef: Yayınlanabilir kalite: nefes ekranı, export/sil, analytics/crash, review istemi, erişilebilirlik, Remote Config.


| ID    | ✓   | Commit Mesajı                       | Adım                                                     | Neden                      | Onay (Doğrulama)                       |
| ----- | --- | ----------------------------------- | -------------------------------------------------------- | -------------------------- | -------------------------------------- |
| T-142 | [✓] | test: breathing logic red+green     | Nefes egzersizi faz/zamanlama mantığı testi + kod        | Sükunet Odası (Soru 8)     | Test yeşil                             |
| T-143 | [✓] | feat: breathing room ui             | BreathingOrb animasyon ekranı (sessiz)                   | Sükunet                    | Ekran çalışıyor (manuel)               |
| T-144 | [✓] | test: data export usecase red+green | JSON export use-case testi + kod                         | Local-first güven          | Test yeşil; geçerli JSON üretiliyor    |
| T-145 | [✓] | test: data delete reset red+green   | Veri silme/sıfırlama testi + kod                         | Gizlilik/uyum              | Test yeşil; veri siliniyor             |
| T-146 | [✓] | feat: analytics adapter events      | Firebase Analytics (gizlilik dostu) olayları             | KPI ölçümü (PRD §18)       | Olaylar konsolda görünüyor             |
| T-147 | [✓] | feat: crashlytics integration       | Crashlytics                                              | Stabilite izleme           | Test crash raporlanıyor                |
| T-148 | [✓] | feat: remote config integration     | Remote Config (model/limit/kota/flag) okuma              | Uzaktan ayar/A-B (Soru 16) | Değer değişince uygulama uyum sağlıyor |
| T-149 | [✓] | feat: in-app review prompt          | İlk "kurtarma" sonrası review istemi                     | ASO/yorum (PRD §14)        | İstem doğru anda tetikleniyor          |
| T-150 | [✓] | feat: accessibility pass            | Etiketler, dinamik font, kontrast, dokunma hedefi        | Erişilebilirlik (PRD §11)  | Ekran okuyucu temel akışı geçiyor      |
| T-151 | [✓] | feat: error empty loading states    | Tüm ekranlarda hata/boş/yükleniyor cilası                | Sağlamlık                  | Kenar durumlar düzgün                  |
| T-152 | [✓] | feat: settings screen complete      | Ayarlar (mercek/dil/tema/bildirim/hesap/export/gizlilik) | Kontrol merkezi            | Tüm ayarlar çalışıyor                  |
| T-153 | [✓] | test: e2e full regression           | Maestro: uçtan uca mutlu yol regresyon paketi            | Tracer Bullet 7 kanıtı     | Tüm E2E akışlar yeşil                  |


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

## FAZ 9 - Tracer Bullet 9: Production NO-GO Kapatma — Ortam, CI ve Repo Hijyeni

> **Kaynak:** Harici production readiness değerlendirmesi (NO-GO) + mevcut test altyapısı turu (T9–T11, coverage ~%47).  
> **Hedef:** Yanlış ortamda yayınlanmayı engelle; CI kırıklığını gider; repo artefaktlarını temizle; test regresyon korumasını sürdür.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-168 | [x] | test: production guard rejects all mock flags red  | (Red) `assertProductionConfig` tüm mock bayrakları (auth/ai/sync/sub/ads/analytics vb.) reddetmeli | P0 #5: eksik guard = prod'da mock                   | Test kırmızı                                                  |
| T-169 | [x] | feat: production guard all mock flags green        | (Green) Guard genişletme + App Check debug token yasağı                                      | Production sahtelik riski                           | T-168 yeşil; prod mock'ta throw                               |
| T-170 | [x] | test: production guard invalid app env red         | (Red) Eksik/hatalı `APP_ENV` -> build/runtime fail (development'a düşme yok)                 | Yanlış env = mock açık kalır                        | Test kırmızı                                                  |
| T-171 | [x] | feat: production guard strict app env green        | (Green) `getAppEnv` strict; bilinmeyen değer -> hata                                         | Fail-closed ortam                                   | T-170 yeşil                                                   |
| T-172 | [x] | build: eas.json production env profile           | `eas.json` production/preview profillerinde `APP_ENV=production` + platform RC key ayrımı   | P0 #5 + #8: platform anahtarları                    | `eas.json` doğrulanıyor; preview/prod env sabit               |
| T-173 | [x] | ci: add production config validation script        | CI'da `APP_ENV=production` simülasyonu ile guard script (`pnpm validate:production`)         | Guard yalnız runtime'da değil CI'da da              | Script prod eksik key'de exit 1                               |
| T-174 | [x] | fix: lint errors blocking ci                       | `habit-card.tsx` + kullanılmayan `eq` importları düzelt                                      | CI lint kırılıyor                                   | `pnpm lint` 0 error                                           |
| T-175 | [x] | chore: gitignore coverage and build logs           | `.gitignore` -> `coverage/`, `*.log`, `admob-build.log`                                      | Fazlalık tracked artefakt (rapor §2)                | `git status` coverage/log göstermiyor                         |
| T-176 | [x] | chore: remove tracked coverage and logs from repo  | Index'ten `coverage/`, `admob-build.log` kaldır (dosyalar sil)                               | Repo şişkinliği + gürültü                           | `git ls-files coverage` boş                                   |
| T-177 | [x] | test: coach chat view send flow red                | (Red) `CoachChatView` gönder/kota/bookmark akışı testi (mock use-case)                       | Önceki plan T12; chat kalbi test dışı               | Test kırmızı                                                  |
| T-178 | [x] | feat: coach chat view send flow green              | (Green) Gerekli küçük düzeltmeler + test geçişi                                                | Chat regresyon koruması                             | T-177 yeşil                                                   |
| T-179 | [x] | ci: maestro smoke workflow draft                   | GitHub Actions: Maestro smoke (4 tab + habit ekle) — başlangıçta `continue-on-error` veya manual | Önceki plan T13/T15; E2E CI yok                   | Workflow dosyası var; lokal `pnpm test:e2e` smoke yeşil       |


---

## FAZ 10 - Tracer Bullet 10: Reklam & AI Kota — Ücretsiz İstismar Kapatma (P0 #1–#2)

> **Hedef:** Production'da sahte reklam ödülü ve sınırsız AI hakkı kapatılır. AdMob geri gelene kadar "reklam izle" UI tamamen gizlenir.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-180 | [x] | test: ads port selection by env red                | (Red) Prod'da mock ads seçilememeli; dev'de mock opsiyonel                                   | P0 #1: her ortamda MockAdsAdapter                   | Test kırmızı                                                  |
| T-181 | [x] | feat: ads port selection by env green              | (Green) `subscription-container` env tabanlı ads adapter seçimi                              | Gerçek/prod ayrımı                                  | T-180 yeşil                                                   |
| T-182 | [x] | test: quota wall hides watch ad when disabled red  | (Red) Ads devre dışıyken QuotaWall'da "reklam izle" görünmemeli                              | Var olmayan özellik gösterimi                       | Test kırmızı                                                  |
| T-183 | [x] | feat: quota wall hides watch ad when disabled green | (Green) QuotaWall koşullu render                                                           | Store/UX dürüstlüğü                                 | T-182 yeşil                                                   |
| T-184 | [x] | test: grant rewarded ad bonus disabled red         | (Red) Ads kapalıyken `GrantRewardedAdBonusUseCase` başarısız/`unavailable`                   | +1 hak sızıntısı                                    | Test kırmızı                                                  |
| T-185 | [x] | feat: grant rewarded ad bonus disabled green       | (Green) Use-case guard                                                                       | Maliyet koruması                                    | T-184 yeşil                                                   |
| T-186 | [x] | docs: ai quota backend adr                         | ADR: sunucu tarafı kota/rate-limit mimarisi (Firebase Functions veya alternatif)           | P0 #2: cihaz kotası bypass edilebilir                | ADR onaylandı; scope net                                      |
| T-187 | [x] | test: server quota port contract red               | (Red) `QuotaPort`/`AiUsagePort` sunucu sözleşmesi testi (mock HTTP/Functions)                | Backend entegrasyon sınırı                          | Test kırmızı                                                  |
| T-188 | [x] | feat: firebase quota function stub green           | (Green) Cloud Function: atomik kota artır + limit kontrol (MVP)                             | Gerçek maliyet koruması                             | T-187 yeşil; emulator/integration test                        |
| T-189 | [x] | feat: client ai usage via server port              | Client `drizzle-ai-usage` yerine/yanında sunucu kotası kullan (feature flag)                 | Bypass kapatma                                      | Prod flag açıkken local reset kota vermez                     |
| T-190 | [x] | feat: remote config ai budget kill switch          | RC: `ai_enabled`, günlük bütçe alarm eşiği, model adı doğrulama                              | P1 operasyonel güvenlik                             | Geçersiz model/kota UI'da güvenli fallback                    |
| T-191 | [x] | test: e2e quota wall no fake ad reward             | Maestro: kota duvarında reklam yok (ads disabled profil)                                     | Tracer Bullet 10 kanıtı                             | E2E yeşil                                                     |


---

## FAZ 11 - Tracer Bullet 11: Veri Bütünlüğü — Çıkış, Silme, Sync (P0 #3–#4)

> **Hedef:** Çıkış yapınca veri kaybı ve sahte "silme" kapatılır. MVP kararı net: **local-only misafir** veya **tam sync** — ikisi karışık kalmaz.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-192 | [x] | docs: sync strategy decision adr                   | ADR: (A) local-only MVP veya (B) full cloud sync — ürün kararı                               | P0 #3: karışık sync iddiası                        | Karar yazılı; PRD/TODO güncellendi                            |
| T-193 | [x] | test: sign out preserves local data red            | (Red) Çıkış local habit/streak silmemeli (A seçilirse) veya önce push etmeli (B)             | Veri kaybı                                          | Test kırmızı                                                  |
| T-194 | [x] | feat: sign out safe behavior green                 | (Green) `auth-session.use-case` ADR'ye göre düzelt                                           | Güvenilir çıkış                                     | T-193 yeşil                                                   |
| T-195 | [x] | test: sync outbox on session red                   | (Red) Oturum sırasında bookmark/chat değişiklikleri outbox'a yazılır (B yolu)               | Çıkış öncesi kayıp                                  | Test kırmızı                                                  |
| T-196 | [x] | feat: sync outbox and flush green                  | (Green) Outbox + periyodik/çıkış öncesi flush                                                | Sürekli sync                                        | T-195 yeşil                                                   |
| T-197 | [x] | feat: firestore tombstone deletes                  | Bookmark silme tombstone; geri gelme engeli                                                  | Sync tutarlılığı                                    | Silinen bookmark geri gelmiyor (test)                         |
| T-198 | [x] | test: reset user data deletes remote red           | (Red) "Verileri sil" Firestore + Auth kapsamını test et                                       | P0 #4: sahte silme                                  | Test kırmızı                                                  |
| T-199 | [x] | feat: account and data deletion flow green         | (Green) Firestore batch delete + Firebase Auth delete + local wipe                             | Apple/Google hesap silme şartı                      | T-198 yeşil                                                   |
| T-200 | [x] | docs: web data deletion request page               | Play Data Safety için web silme talep URL'si + süreç                                         | Mağaza uyumu                                        | URL erişilebilir; store formuna girildi                       |
| T-201 | [x] | feat: sqlite user scoping or guest isolation       | Tablolara `userId` veya misafir oturum izolasyonu (ADR'ye göre)                             | Hesap değişiminde veri sızıntısı                    | Başka kullanıcı verisi görünmüyor (test)                      |
| T-202 | [x] | feat: auth required route group guard            | `(tabs)` ve korumalı route'lar oturum/onboarding guard                                       | P1: çıkış sonrası tab'da kalma                      | Çıkış -> auth/onboarding yönlendirme                          |
| T-203 | [x] | test: e2e sign out data persistence                | Maestro: giriş -> habit -> çıkış -> tekrar giriş -> veri durumu ADR beklentisi               | Tracer Bullet 11 kanıtı                             | E2E yeşil                                                     |


---

## FAZ 12 - Tracer Bullet 12: Kriz Güvenliği & AI Mağaza Uyumu (P0 #6–#7)

> **Hedef:** Kriz kaynakları doğru ve çok dilli; AI cevapları raporlanabilir; çıktı moderasyonu eklenir.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-204 | [x] | test: crisis resources correct numbers red         | (Red) 182 ALİZE/MHRS karışıklığı yok; 112 acil; kaynaklar doğrulanmış                        | P0 #6: tehlikeli yanlış bilgi                       | Test kırmızı                                                  |
| T-205 | [x] | feat: crisis resources verified green              | (Green) `crisis-guardrail.ts` düzelt + i18n kaynak metinleri                                  | Kullanıcı güvenliği                                 | T-204 yeşil; uzman checklist imzalı                           |
| T-206 | [x] | test: crisis message locale red                    | (Red) Kriz yanıtı kullanıcı dilinde                                                        | Yalnızca TR mesaj                                   | Test kırmızı                                                  |
| T-207 | [x] | feat: crisis message i18n green                    | (Green) en/tr (ve ADR'deki diller) kriz şablonları                                           | Global kullanıcı                                    | T-206 yeşil                                                   |
| T-208 | [x] | test: ai output guardrail red                      | (Red) AI çıktısı ikinci katman moderasyon (hallüsinasyon/kriz/off-topic)                     | P0 #6–#7: tek katman yetersiz                       | Test kırmızı                                                  |
| T-209 | [x] | feat: ai output guardrail green                    | (Green) `output-guardrail.ts` + coach pipeline entegrasyonu                                  | Güvenli fallback                                    | T-208 yeşil                                                   |
| T-210 | [x] | test: report ai response usecase red               | (Red) Kullanıcı AI cevabını raporlar (kategori + mesaj id)                                   | Google Play AI politikası                           | Test kırmızı                                                  |
| T-211 | [x] | feat: report ai response ui and storage green      | (Green) ChatBubble "Raporla" + Firestore/Analytics kayıt                                     | Store şartı                                         | T-210 yeşil; rapor backend'de görünür                         |
| T-212 | [x] | feat: gemini safety settings production            | Firebase AI `safetySettings` production profili                                                | Model güvenlik katmanı                              | Red-team örnekleri bloklanıyor (log)                          |
| T-213 | [x] | test: e2e crisis shows safe resources              | Maestro: kriz tetikleyici girdi -> koçluk yok, kaynaklar görünür                             | Tracer Bullet 12 kanıtı                             | E2E yeşil                                                     |


---

## FAZ 13 - Tracer Bullet 13: Abonelik, Paywall & Yasal Uyum (P0 #8–#9)

> **Hedef:** Paywall mağaza reddine açık boşluklar kapanır; gizlilik/şartlar erişilebilir; Plus iddiası gerçekle eşleşir.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-214 | [x] | test: revenuecat per platform keys red             | (Red) iOS/Android ayrı RC API key seçimi                                                     | P0 #8: tek key riski                                | Test kırmızı                                                  |
| T-215 | [x] | feat: revenuecat per platform keys green           | (Green) `app.config` + adapter platform key                                                  | Doğru entitlement                                   | T-214 yeşil                                                   |
| T-216 | [x] | test: trial label accuracy red                     | (Red) `introPrice !== null` != "ücretsiz deneme" yanlış etiket                               | Yanıltıcı paywall                                   | Test kırmızı                                                  |
| T-217 | [x] | feat: trial label accuracy green                   | (Green) Gerçek trial/eligibility kontrolü                                                    | Store policy                                        | T-216 yeşil                                                   |
| T-218 | [x] | feat: paywall legal links and renewal terms        | Otomatik yenileme, fiyat/süre, Terms + Privacy linkleri                                      | Google/Apple subscription kuralları                 | Paywall'da linkler çalışıyor                                  |
| T-219 | [x] | feat: paywall empty offering error state           | Offering yüklenemezse hata UI + retry; satın alma hataları kullanıcıya                         | Boş ekran riski                                     | Offline/RC hata senaryosu testli                              |
| T-220 | [x] | docs: privacy policy and terms publish             | Gizlilik politikası + kullanım şartları (AI/Firebase/RC/Analytics açık)                      | P0 #9: erişilebilir politika yok                    | URL'ler uygulama içi + store metadata'da                      |
| T-221 | [x] | feat: plus entitlement gating sync bookmark        | Bookmark sync yalnız Plus (veya ADR: ücretsiz — metinler eşleşsin)                           | Yanlış satış iddiası                                | Free/Plus davranışı PRD ile aynı                            |
| T-222 | [x] | test: onboarding paywall flow alignment red        | (Red) Onboarding -> auth akışı vs eski paywall/Maestro beklentisi                            | Stale akış                                          | Test kırmızı                                                  |
| T-223 | [x] | feat: onboarding paywall flow alignment green      | (Green) Maestro + dokümantasyon güncelle (soft paywall profil/kota anında)                   | Test/store tutarlılığı                              | T-222 yeşil; `.maestro/onboarding*.yaml` güncel               |
| T-224 | [x] | chore: store subscription metadata                 | Play/App Store abonelik açıklamaları trial/renewal ile eşleşsin                              | Manuel review                                       | Store formları dolduruldu                                     |


---

## FAZ 14 - Tracer Bullet 14: i18n, Tema Boot & EN/TR Production Scope (P0 #10)

> **Hedef:** Tercihler yeniden açılışta uygulanır; yarım diller kaldırılır veya tamamlanır; hardcoded TR temizlenir.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-225 | [x] | test: theme hydrate from settings red              | (Red) Uygulama açılışında SQLite tema tercihi yüklenmeli                                     | P0 #10: her açılış auto                               | Test kırmızı                                                  |
| T-226 | [x] | feat: theme hydrate from settings green            | (Green) Root'ta settings okuma -> `AppThemeProvider` initial                                 | Tutarlı tema                                        | T-225 yeşil                                                   |
| T-227 | [x] | test: language hydrate from settings red           | (Red) Uygulama açılışında kayıtlı dil yüklenmeli                                             | Cihaz dili override                                 | Test kırmızı                                                  |
| T-228 | [x] | feat: language hydrate from settings green         | (Green) `I18nProvider` boot hydrate                                                          | Profil ayarı kalıcı                                 | T-227 yeşil                                                   |
| T-229 | [x] | docs: locale scope decision en tr only             | Karar: lansman EN+TR; ar/ja/fr kaldır veya gizle                                             | 51 vs 121 anahtar riski                             | Karar yazılı                                                  |
| T-230 | [x] | feat: remove or hide incomplete locales            | ar/ja/fr scaffolding kaldır/gizle (karara göre)                                              | Yarım çeviri production riski                       | Uygulamada yalnız EN/TR seçilebilir                           |
| T-231 | [x] | feat: i18n hardcoded turkish strings               | `MicroTaskCard`, `ChatBubble`, kriz/hata metinlerini i18n'e taşı                             | Karışık dil UX                                      | `pnpm test` + manuel EN ekran kontrolü                        |
| T-232 | [x] | feat: ai response language in prompt               | Prompt builder'a cevap dili (`settings.language`) ekle                                       | AI Türkçe/İngilizce uyumu                           | EN profilde EN coach cevabı (test/mock)                     |
| T-233 | [x] | test: e2e language persistence                     | Maestro: TR seç -> kill -> reopen -> TR                                                        | Tracer Bullet 14 kanıtı                             | E2E yeşil                                                     |


---

## FAZ 15 - Tracer Bullet 15: UX & Altyapı Sağlamlaştırma (P1)

> **Hedef:** Hata sınırları, Firestore doğrulama, bildirim doğruluğu, Android yedekleme, chat geçmişi kararı.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-234 | [x] | feat: root error boundary and migration error ui   | Error boundary + migration fail ekranı + retry                                               | P1: sessiz crash                                    | Migration hatası kullanıcıya gösteriliyor                     |
| T-235 | [x] | feat: unhandled promise rejection logging          | Kritik `void promise` noktalarında catch + Crashlytics                                       | P1: kayıp hatalar                                   | Simüle hata loglanıyor                                        |
| T-236 | [x] | test: firestore payload zod validation red         | (Red) Sync payload boyut/rol/tarih sınırları                                                 | P1: rules yalnız UID                                | Test kırmızı                                                  |
| T-237 | [x] | feat: firestore payload zod validation green       | (Green) Push/pull öncesi Zod                                                                 | Injection/oversize                                  | T-236 yeşil                                                   |
| T-238 | [x] | build: disable android backup sensitive data       | `allowBackup=false` veya hassas DB exclude                                                   | P1: SQLite düz metin yedek                          | Manifest doğrulandı                                           |
| T-239 | [x] | build: production manifest permissions audit       | `SYSTEM_ALERT_WINDOW`, eski storage izinleri; dev-client prod'dan ayrılsın                   | Gereksiz izin reddi                                 | Production manifest minimal                                   |
| T-240 | [x] | test: notification frequency labels red            | (Red) "Günde bir" = gerçek bildirim sayısı eşleşmeli                                         | P1: yanlış beklenti                                  | Test kırmızı                                                  |
| T-241 | [x] | feat: notification frequency labels green          | (Green) `notification-schedule.ts` düzelt veya UI metni güncelle                             | Güven                                               | T-240 yeşil                                                   |
| T-242 | [x] | docs: chat history product decision                | Sohbet geçmişi gösterilecek mi / silinecek mi — ADR                                           | Saklanıyor ama UI yok                               | Karar + backlog net                                           |
| T-243 | [x] | feat: chat history ui or stop collecting           | ADR'ye göre geçmiş ekranı veya toplamayı durdur                                               | Gereksiz hassas veri                                | Uygulama davranışı ADR ile uyumlu                             |
| T-244 | [x] | feat: global chat multi turn context               | Genel/habit chat'te önceki mesajları modele gönder (limitli)                                 | P1: sahte multi-turn                                | 2+ tur bağlam korunuyor (test)                                |
| T-245 | [x] | feat: quota ui reads remote config limit           | Kota mesajı sabit "3" yerine RC `freeAiQuota`                                                 | P1: yanlış UI                                       | RC değişince mesaj güncellenir                                |
| T-246 | [x] | feat: defer store review until meaningful usage    | İlk rescue yerine N gün / N rescue eşiği                                                     | P1: agresif review                                  | Review tetik eşiği testli                                       |


---

## FAZ 16 - Tracer Bullet 16: Kod & Bağımlılık Temizliği (Fazlalık Raporu §2)

> **Hedef:** Dead code, kullanılmayan bağımlılıklar ve boş katman dosyaları kaldırılır; bundle/native risk azalır.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-247 | [x] | refactor: remove empty layer index files           | `src/{application,domain,infrastructure,presentation}/index.ts` boş exportları kaldır      | Kesin fazlalık                                      | Import kırılmıyor; `pnpm typecheck` ok                        |
| T-248 | [x] | refactor: remove unused health check chain         | health-check port/use-case/adapter/hook (+ testleri birleştir veya kaldır)                   | Kullanılmayan zincir                                | `pnpm test` yeşil; referans yok                               |
| T-249 | [x] | refactor: remove unused theme hooks                | `use-theme.ts`, `use-color-scheme*.ts` kaldır                                                | Yeni theme provider var                             | Derleme yeşil                                                 |
| T-250 | [x] | refactor: remove unused speech module              | `speech.ts` + `expo-speech` (TTS kullanılmıyorsa)                                            | Dead feature                                        | Bundle küçülür; manuel kontrol                                |
| T-251 | [x] | refactor: remove dead auth and ai adapters           | `SignOutUseCase`, `FirebasePreclassifierAdapter`, `GetEntitlementUseCase` (kullanılmıyorsa)    | Bakım yükü                                          | Testler güncel; grep referans 0                               |
| T-252 | [x] | refactor: simplify subscription di wiring          | Kullanılmayan `PurchaseSubscriptionUseCase`/`RestorePurchasesUseCase` container wiring       | Duplike DI                                          | Paywall hâlâ çalışıyor (test)                               |
| T-253 | [x] | chore: remove unused test-renderer direct dep      | `package.json` `test-renderer` kaldır (jest-expo yeterli)                                    | Fazlalık bağımlılık                                 | `pnpm test` yeşil                                             |
| T-254 | [x] | chore: audit optional expo deps                    | `@expo/ui`, `expo-device`, `expo-font`, `expo-status-bar`, `expo-system-ui` — doctor/build   | Olası unused deps                                   | `npx expo-doctor` + Android build yeşil                       |
| T-255 | [x] | docs: web support decision                         | `react-dom`/`react-native-web` kalacak mı — karar                                            | Yarım web yükü                                      | ADR yazılı                                                    |
| T-256 | [x] | chore: remove settings redirect route if unused    | `/(tabs)/settings` yalnız legacy ise kaldır + deep link map                                  | Fazlalık route                                      | Eski link varsa redirect root'ta                              |


---

## FAZ 17 - Tracer Bullet 17: Test & Coverage Production Grade (Devam)

> **Hedef:** Coverage %55+ bandına çıkar; DI/Firebase/hook katmanları test edilir; CI E2E zorunlu hale getirilir; FAZ 8 lansman adımlarına geçiş.

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-257 | [x] | feat: render with providers adopt in screen tests  | Mevcut ekran testlerini `renderWithProviders` helper'a taşı                                  | T9: tekrarlayan mock azaltma                        | Test suite yeşil                                              |
| T-258 | [x] | test: firebase provider bootstrap red              | (Red) `FirebaseProvider` init/hata yolu testi                                                | Coverage boşluğu                                    | Test kırmızı                                                  |
| T-259 | [x] | feat: firebase provider bootstrap green            | (Green) Provider test geçişi                                                                 | Regresyon                                           | T-258 yeşil                                                   |
| T-260 | [x] | test: subscription container ports red             | (Red) DI container mock bayrak seçimi testleri                                               | Prod/dev adapter ayrımı                             | Test kırmızı                                                  |
| T-261 | [x] | feat: subscription container ports green           | (Green) Container refactor testleri                                                          | Güvenli DI                                          | T-260 yeşil                                                   |
| T-262 | [x] | ci: raise coverage threshold to 55                 | Jest global threshold 55% (aşamalı); CI fail on regression                                    | T8 devamı                                           | `pnpm test:ci` threshold geçiyor                              |
| T-263 | [x] | ci: maestro required on main                       | Maestro smoke CI'da zorunlu (continue-on-error kaldır)                                       | T13 tamamlama                                       | PR'da E2E yeşil olmadan merge yok                             |
| T-264 | [x] | ci: pnpm audit in pipeline                         | CI'da `pnpm audit` (high/critical fail veya uyarı)                                           | Güvenlik taraması timeout çözümü                    | Audit adımı CI'da çalışıyor                                   |
| T-265 | [x] | test: e2e four tab navigation smoke                | Maestro: 4 tab geçişi + habit ekle smoke                                                     | T15                                               | `.maestro/` yeşil                                             |
| T-266 | [x] | chore: re enable admob production guard keys       | AdMob paketi geri eklendiğinde guard + `T-137` adapter geri yükleme checklist               | T16; Play gelir planı                               | Guard testleri AdMob key ile yeşil                            |
| T-267 | [x] | build: eas preview internal track pipeline         | EAS preview profile + internal Play track doğrulama                                          | T17; gerçek cihaz testi                             | Preview build cihazda açılıyor                                |
| T-268 | [x] | chore: production go no go checklist               | NO-GO maddeleri checklist (P0 tamam mı) + FAZ 8 T-154–T-166'ya handoff                      | Lansman kapısı                                      | Checklist imzalı; GO/NO-GO kararı                            |


---

## FAZ 18 - Tracer Bullet 18: UX Polish, Liquid Glass & Coach Deneyimi (Emulator QA Geri Bildirimi)

> **Hedef:** Emulator manuel QA'da raporlanan UX/UI sorunları kapanır: onboarding yeniden görünürlüğü, liquid glass görsel dil, profil/habit/coach akışları, dopamin animasyonları ve chat oturum kalıcılığı.
> **Kaynak:** Kullanıcı geri bildirimi (11 madde) — **FAZ 18.1–18.7 implementasyonu tamamlandı** (Temmuz 2026).
> **Branch önerisi:** `phase-18-ux-polish`

### Kullanıcı Geri Bildirimi Özeti

| # | Konu | Beklenti |
| --- | --- | --- |
| 1 | Onboarding | İlk kurulum/test akışında onboarding ekranları görünmeli |
| 2 | Profile | Profil sayfası görsel olarak iyileştirilmeli |
| 3 | Liquid Glass | Apple liquid glass tasarım dili; basit UI yerine cam/blur/derinlik |
| 4 | Habit title input | İlk backspace tüm metni silmemeli |
| 5 | Done animasyonu | "Great!" yerine dopamin veren kutlama animasyonu |
| 6 | Habit detay | Habit'e tıklayınca düzenleme, timer, notlar |
| 7 | Add habit | Daha özelleştirilebilir habit oluşturma |
| 8 | Coach aksiyonları | Save/Regenerate/Report metin yerine ikon |
| 9 | Rescue (Done) | Habit menüsüne yönlendir; chat kaybolmasın |
| 10 | Chat oturumu | Üstte X / New Chat; tab geçişinde chat sıfırlanmasın |
| 11 | AI yanıtına cevap | Kullanıcı koç mesajına serbest metinle devam edebilmeli |

---

### 18.1 — Onboarding Görünürlüğü & Test Akışı (#1)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-269 | [x] | test: onboarding gate when not completed red       | (Red) `index` route: `onboardingCompleted=false` iken `/onboarding` yönlendirmesi            | Kullanıcı onboarding görmedi                        | Test kırmızı                                                  |
| T-270 | [x] | feat: onboarding gate when not completed green     | (Green) Mevcut gate doğrulanır; `onboardingCompleted=true` ise auth/tabs'a geçiş             | Kalıcı SQLite state ile karışıklık önlenir          | T-269 yeşil                                                   |
| T-271 | [x] | feat: maestro clear state before onboarding        | `.maestro/onboarding_to_dashboard.yaml` ve smoke flow'a `clearState` / fresh install adımı | E2E/manuel QA'da onboarding atlanmaz               | Maestro flow onboarding ekranlarını assert ediyor             |
| T-272 | [x] | feat: replay onboarding from profile               | Profil veya geliştirici ayarı: onboarding'i yeniden oynat (flag sıfırla + yönlendir)       | QA ve demo için onboarding tekrar görülebilir        | Profil'den onboarding açılıyor; veri ADR'ye uygun           |
| T-273 | [x] | test: e2e onboarding full flow                     | Maestro: approach → identity → habits → blockers → tone → finish → auth → dashboard          | Tracer Bullet 18.1 kanıtı                           | `.maestro/onboarding*.yaml` yeşil                             |


---

### 18.2 — Liquid Glass Tasarım Sistemi (#3, temel görsel dil)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-274 | [x] | docs: liquid glass design tokens adr                 | Blur, border, shadow, opacity, radius token'ları + dark/light kuralları (ADR)                | Tutarlı Apple-style cam dili                        | ADR onaylı; `GlassCard` referans alınır                       |
| T-275 | [x] | test: glass card variants red                       | (Red) `GlassCard` variant prop'ları (elevated, subtle, accent) render testi                  | Tek stil yetersiz                                   | Test kırmızı                                                  |
| T-276 | [x] | feat: glass card variants green                      | (Green) `expo-blur` / gradient border ile liquid glass primitive'ler                         | Yeniden kullanılabilir UI katmanı                   | T-275 yeşil; iOS/Android blur fallback                        |
| T-277 | [x] | feat: apply glass system to core screens           | Home, auth, tabs header, onboarding adımlarına glass uygula                                  | "Çok basit UI" geri bildirimi                       | Manuel: cam efekt + okunabilir kontrast                       |
| T-278 | [x] | feat: motion and micro interactions baseline       | Press scale, tab geçişi, kart giriş animasyonları (Reanimated)                               | Premium his                                         | Animasyonlar 60fps; reduced-motion saygılı                    |


---

### 18.3 — Profile Sayfası Yenileme (#2)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-279 | [x] | test: profile screen layout red                    | (Red) Profil bölümleri (avatar, stats, ayarlar, yaklaşım) yapısal test                       | Mevcut layout "kötü görünüyor"                      | Test kırmızı                                                  |
| T-280 | [x] | feat: profile liquid glass redesign green          | (Green) Profil: glass kartlar, hiyerarşi, spacing, tipografi                                 | Kullanıcı geri bildirimi #2                         | T-279 yeşil; EN/TR metinler taşmıyor                          |
| T-281 | [x] | feat: profile stats and identity polish              | Streak/identity/approach görsel sunumu; boş durumlar                                           | Profil bilgi yoğunluğu dengeli                      | Manuel profil ekranı screenshot-ready                         |


---

### 18.4 — Habit Form Bug & Gelişmiş Oluşturma (#4, #7)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-282 | [x] | test: habit title backspace behavior red           | (Red) Title alanına metin yaz → ilk backspace yalnızca son karakteri silmeli                 | P0 UX bug: tüm metin siliniyor                      | Test kırmızı                                                  |
| T-283 | [x] | feat: habit title input fix green                  | (Green) Controlled input / selection / defaultValue bug düzelt                                 | Güvenilir metin girişi                              | T-282 yeşil; manuel doğrulama                                 |
| T-284 | [x] | test: expanded create habit fields red             | (Red) Create habit: hatırlatma, sıklık, ikon/renk (ADR'de seçilen alt küme)                   | "Add habit çok basit"                               | Test kırmızı                                                  |
| T-285 | [x] | feat: expanded create habit form green             | (Green) Genişletilmiş add-habit UI + validation + i18n                                        | Özelleştirilebilir habit                              | T-284 yeşil; habit DB şeması uyumlu                           |


---

### 18.5 — Habit Detay Ekranı (#6)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-286 | [x] | test: habit detail route and edit red              | (Red) Habit kartına tıklayınca `/habit/[id]` detay; title düzenleme                          | Habit menüsü yok                                    | Test kırmızı                                                  |
| T-287 | [x] | feat: habit detail screen scaffold green           | (Green) Detay ekranı: düzenle, sil, streak özeti                                             | Temel habit hub                                     | T-286 yeşil                                                   |
| T-288 | [x] | feat: habit timer optional                         | Opsiyonel odak/timer (countdown veya pomodoro-lite) habit detayda                            | Kullanıcı isteği #6                                 | Timer start/stop testli; arka planda davranış ADR               |
| T-289 | [x] | feat: habit notes journal                          | Habit'e bağlı notlar (SQLite); detay ekranında liste + ekle                                  | Reflection / not bırakma                            | Not CRUD testleri yeşil                                       |
| T-290 | [x] | test: e2e habit detail navigation                  | Maestro: habit oluştur → detaya gir → düzenle → geri                                          | Tracer Bullet 18.5 kanıtı                           | Maestro yeşil                                                 |


---

### 18.6 — Done Kutlama Animasyonu (#5)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-291 | [x] | test: mark done celebration trigger red            | (Red) Done sonrası celebration overlay/haptic tetiklenmeli                                   | Mevcut "Great!" çok basit                           | Test kırmızı                                                  |
| T-292 | [x] | feat: dopamine celebration animation green         | (Green) Reanimated + haptic: confetti/pulse/streak glow; kısa süreli overlay                   | Dopamin / destek hissi                              | T-291 yeşil; erişilebilir alternatif metin                    |
| T-293 | [x] | feat: celebration copy and streak context          | Streak sayısına göre dinamik mesaj; sound opsiyonel (ADR)                                    | Kişiselleştirilmiş kutlama                          | 1. vs 7. gün farklı mesaj (test/mock)                         |


---

### 18.7 — Coach UI: İkonlar, Rescue Akışı, Oturum (#8, #9, #10, #11)

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-294 | [x] | test: coach message icon actions red                 | (Red) Save/Regenerate/Report yalnızca ikon + accessibilityLabel; metin buton yok             | Geri bildirim #8                                    | Test kırmızı                                                  |
| T-295 | [x] | feat: coach message icon actions green             | (Green) Bookmark, regenerate, report ikonları (`@expo/vector-icons` veya mevcut set)          | Temiz coach UI                                      | T-294 yeşil; ekran okuyucu etiketleri                         |
| T-296 | [x] | test: rescue done navigates to habit red           | (Red) Coach "Done (rescue)" → ilgili habit detay/ana sayfa; chat state korunur               | Geri bildirim #9                                    | Test kırmızı                                                  |
| T-297 | [x] | feat: rescue flow navigation and chat persist green| (Green) Rescue tamamlanınca habit hub'a yönlendir; mesajlar SQLite'da kalır                  | Chat kaybolmamalı                                   | T-296 yeşil; excuse + global chat senaryoları                 |
| T-298 | [x] | test: chat session survives tab switch red         | (Red) Tab değişiminde aktif chat thread sıfırlanmamalı                                       | Geri bildirim #10                                   | Test kırmızı                                                  |
| T-299 | [x] | feat: chat header close and new chat green         | (Green) Üst bar: X (kapat) veya "New chat"; explicit reset yalnızca bu aksiyonla             | Kullanıcı kontrolü                                  | T-298 yeşil; yeni chat boş thread açar                        |
| T-300 | [x] | test: user reply after coach message red           | (Red) Koç cevabından sonra kullanıcı serbest metin gönderebilmeli (multi-turn)               | Geri bildirim #11                                   | Test kırmızı                                                  |
| T-301 | [x] | feat: user follow up messages green                | (Green) Input her zaman aktif (kriz/rescue modları hariç); prompt'a user reply dahil           | Gerçek sohbet hissi                                 | T-300 yeşil; kota sayacı doğru                                |
| T-302 | [x] | test: e2e coach session persistence                | Maestro: chat yaz → tab değiştir → chat aynı → new chat → eski kayıtlı                       | Tracer Bullet 18.7 kanıtı                           | Maestro yeşil                                                 |


---

### 18.8 — Faz Kapanışı

| ID    | ✓   | Commit Mesajı                                      | Adım                                                                                         | Neden                                              | Onay (Doğrulama)                                              |
| ----- | --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| T-303 | [x] | chore: faz18 manual qa checklist                     | Emulator QA checklist: 11 madde + liquid glass görsel kontrol                                | Regresyon önleme                                    | `docs/faz18-manual-qa-checklist.md` (imza: emulator QA bekliyor) |
| T-304 | [x] | ci: maestro faz18 flows in regression                | `full_regression.yaml` veya smoke'e yeni coach/habit/onboarding flow'ları ekle             | CI kanıtı                                           | `pnpm test:e2e:validate` yeşil; cihaz E2E kullanıcı tarafında  |
| T-305 | [x] | docs: update prd ux section post faz18               | PRD/TODO'da tamamlanan UX maddelerini işaretle; kalan backlog notu                           | Dokümantasyon senkron                               | PRD §5.1 + §11 güncel                                         |


---

## Özet

- **18 Tracer Bullet fazı, 305 atomik adım** (FAZ 0–17: T-001–T-268 tamamlandı; **FAZ 18: T-269–T-305 UX polish & coach deneyimi — tamamlandı**; emulator manuel QA imzası `docs/faz18-manual-qa-checklist.md` üzerinde bekliyor).
- **NO-GO öncelik sırası:** FAZ 9 (ortam/CI) → FAZ 10 (reklam/kota) → FAZ 11 (veri/sync) → FAZ 12 (kriz/AI rapor) → FAZ 13 (paywall/legal) → FAZ 14 (i18n boot) → FAZ 15–16 (sağlamlaştırma/temizlik) → FAZ 17 (test/coverage/E2E) → **FAZ 18 (UX polish — emulator QA)** → FAZ 8 lansman (T-154+).
- **Harici rapor ile hizalama:** P0 maddeleri (1–10) FAZ 10–14'te; fazlalık temizliği FAZ 16'da; test/coverage hedefi FAZ 17'de; **emulator manuel QA geri bildirimi FAZ 18'de**.
- **Mevcut test durumu (referans):** 109 suite, 310 test — FAZ 18 tamamlandı; Maestro yapı validate CI'da zorunlu (`pnpm test:e2e:validate`).
- **TDD:** mantık adımları `test:` (Red) -> `feat:` (Green) çiftleri halinde devam eder.
- **Güvenlik:** her adımda Review & Güvenlik Protokolü; **yeni güvenlik-kritik ID'ler:** T-169, T-171, T-188, T-189, T-199, T-205, T-209, T-211, T-212, T-237, T-260, T-264, T-266.

Production-grade hedefe ulaşmak için **T-168**'den başlanır; FAZ 18 emulator QA sonrası UX polish için **T-269**'dan devam edilir; her faz bitince GO/NO-GO checklist (T-268) güncellenir.