# ADR 005: Sohbet Geçmişi

## Durum

Kabul edildi — FAZ 15 (T-242/T-243)

## Karar

- SQLite'da habit başına chat mesajları **saklanmaya devam eder** (kayıtlı kullanıcıda sync).
- Coach ekranı açıldığında geçmiş mesajlar **yüklenir ve gösterilir**.
- Hassas veri minimizasyonu: yalnızca son oturum mesajları modele gönderilir (`MAX_CONVERSATION_TURNS = 6`).
- Ayrı “chat arşivi” ekranı MVP dışı; Saved tab bookmark odaklı kalır.

## Sonuçlar

- Kullanıcı çok turlu sohbet deneyimi görür.
- AI bağlamı gerçek geçmişten beslenir.
- Phase 2: tam arşiv, silme, export filtreleri.
