# ADR 007: Liquid Glass Tasarım Sistemi

## Durum

Kabul edildi — FAZ 18.2 (UX polish)

## Bağlam

- Kullanıcı geri bildirimi: UI çok basit; Apple **liquid glass** (cam, blur, derinlik) dili isteniyor.
- Projede `expo-glass-effect` (iOS 26+), `expo-blur` ve `GlassCard` zaten mevcut.
- Android emülatör/cihazlarda native liquid glass yok; blur + yarı saydam yüzey fallback gerekli.
- Erişilebilirlik: iOS **Reduce Transparency** açıkken opak yüzey kullanılmalı.

## Karar

Merkezi **glass token** katmanı + `GlassCard` **variant** prop'ları:

| Variant | Kullanım | Blur (fallback) | Border | Shadow |
| --- | --- | --- | --- | --- |
| `subtle` | İç içe kartlar, chip'ler | 32 | white/12 | none |
| `elevated` | Ana kartlar (default) | 48 | white/22 | soft elevation |
| `accent` | Seçili chip, vurgu | 52 | accent/35 | accent glow |

### Tema kuralları

| Token | Light | Dark |
| --- | --- | --- |
| Canvas | `ivory` (#FBF7F1) | `charcoal` (#14110E) |
| Opaque surface | `surface/95` | `surface-dark/95` |
| Blur tint | `light` | `dark` |
| Liquid glass style (iOS) | `clear` | `regular` |
| Radius | `rounded-2xl` (16px) | aynı |

### Platform fallback sırası

1. iOS + `isLiquidGlassAvailable()` → `GlassView`
2. iOS/Android + blur destekli → `BlurView` (intensity variant'a göre)
3. Reduce transparency / blur yok → opak `surface` + border

### Hareket (micro-interactions)

- `GlassPressable`: press scale 0.97 (reduce motion kapalıysa)
- Liste kartları: `FadeInDown` giriş (stagger 40ms)
- Tab bar: blur arka plan (`expo-blur`)

## Sonuçlar

- Tüm cam yüzeyler `GlassCard` / `glass-tokens.ts` üzerinden yönetilir.
- Yeni ekranlar variant seçerek tutarlı kalır.
- FAZ 18.3 (Profile redesign) bu token'lara dayanır.

## Referans

- `src/presentation/theme/glass-tokens.ts`
- `src/presentation/components/glass-card.tsx`
- `src/presentation/components/glass-pressable.tsx`
