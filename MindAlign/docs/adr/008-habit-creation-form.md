# ADR 008: Habit Oluşturma Formu Kapsamı (FAZ 18.4)

## Durum

Kabul edildi — FAZ 18.4

## Karar

Genişletilmiş **Add Habit** formu şu alanları içerir (DB migration gerekmez):

| Alan | Depolama | Not |
| --- | --- | --- |
| Title | `habits.title` | Zorunlu |
| Note | `habits.description` | Opsiyonel motivasyon notu |
| Accent | `habits.sortOrder` bantları | 0=neutral, 100=emerald, 200=amber, 300=sky |
| Reminders | oluşturma akışı | Açıksa profil penceresine göre bildirim planlanır |

Per-habit bildirim penceresi ve ikon kütüphanesi Phase 2.

## TextInput backspace

Title alanı `BlurView` içinde doğrudan `className` ile stillenmez; opak sarmalayıcı + `StyleSheet` kullanılır (Android backspace/regression önlemi).
