# FAZ 18 — Manuel QA Checklist (T-303)

**Last updated:** FAZ 18.8  
**Platform:** Android emulator veya fiziksel cihaz (önerilen: Pixel API 34+)  
**Durum:** Checklist hazır — **emulator QA henüz çalıştırılmadı** (imza bekliyor)

## Ön koşullar

- [ ] Fresh install veya profilden **Onboarding'i yeniden oynat** ile temiz onboarding akışı
- [ ] `APP_ENV=development`, mock AI açık (hızlı koç yanıtı)
- [ ] EN ve TR dilinde en az bir tur kontrol

---

## 11 madde — Kullanıcı geri bildirimi

| # | Konu | Adımlar | Beklenen | Pass |
| --- | --- | --- | --- | --- |
| 1 | Onboarding görünürlüğü | Uygulamayı temiz kur → aç | Onboarding ekranları görünür; atlanmaz | ☐ |
| 2 | Profil sayfası | Profil sekmesi | Glass kartlar, avatar/stats/approach hiyerarşisi okunaklı | ☐ |
| 3 | Liquid Glass | Home, auth, onboarding, profil, tab bar | Blur/cam derinlik; metin AA kontrast; dark/light tutarlı | ☐ |
| 4 | Habit title backspace | Yeni alışkanlık → title'a metin yaz → backspace | Yalnızca son karakter silinir; tüm metin silinmez | ☐ |
| 5 | Done kutlama | Habit kartında "Yaptım" | Confetti/pulse overlay + haptic; streak'e göre mesaj | ☐ |
| 6 | Habit detay | Habit başlığına dokun | `/habit/[id]`: düzenle, sil, streak, timer, notlar | ☐ |
| 7 | Genişletilmiş add habit | Yeni alışkanlık formu | Hatırlatma/sıklık/renk alanları; validation çalışır | ☐ |
| 8 | Coach ikon aksiyonları | Koç yanıtında bookmark / regenerate / report | Yalnızca ikon + accessibilityLabel; metin buton yok | ☐ |
| 9 | Rescue → habit hub | Excuse veya koçta rescue tamamla | İlgili habit detayına gider; sohbet SQLite'da kalır | ☐ |
| 10 | Chat oturumu | Koç sekmesinde mesaj yaz → tab değiştir → geri dön | Thread korunur; X kapatır; "Yeni sohbet" explicit reset | ☐ |
| 11 | Koça cevap | Koç yanıtından sonra serbest metin gönder | Input aktif; multi-turn devam eder (kriz modu hariç) | ☐ |

---

## Liquid Glass görsel kontrol (ek)

| Ekran | subtle | elevated | accent | Reduce transparency fallback |
| --- | --- | --- | --- | --- |
| Dashboard / habit kartları | ☐ | ☐ | ☐ | ☐ |
| Onboarding adımları | ☐ | ☐ | ☐ | ☐ |
| Auth ekranı | ☐ | ☐ | ☐ | ☐ |
| Profil | ☐ | ☐ | ☐ | ☐ |
| Paywall / kota duvarı | ☐ | ☐ | ☐ | ☐ |
| Tab bar / header | ☐ | ☐ | ☐ | ☐ |

**Referans:** [ADR 007 — Liquid Glass](adr/007-liquid-glass-design.md)

---

## Regresyon smoke (hızlı)

- [ ] 4 tab geçişi (Home → Chat → Saved → Profile)
- [ ] Misafir giriş → dashboard
- [ ] Habit mark done → streak artışı

**Maestro (cihazda):** `.maestro/smoke_four_tabs.yaml`, `.maestro/full_regression.yaml`

---

## Sign-off

| Rol | Name | Date | Pass / Fail |
| --- | --- | --- | --- |
| QA | | | |
| Product | | | |
| Engineering | | | |

**Not:** Otomatik testler (Jest) FAZ 18.7 sonunda 109 suite / 310 test yeşil. Bu checklist yalnızca emulator/cihaz görsel ve akış doğrulaması içindir.
