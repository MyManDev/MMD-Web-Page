---
description: Gün sonu devir — HANDOFF.md'yi güncelle, commit'le, push et
---

Bugünlük iş bu hesapta bitti. Diğer hesabın (iş/ev) sıfırdan devam edebilmesi için devir kaydını
hazırla. İki hesap arasında paylaşılan tek bellek bu repo; sohbet geçmişi taşınmıyor.

Adımlar:

1. Durumu **ölç, hatırlamaya çalışma**: `git status`, `git branch --show-current`,
   `git log --oneline -10`, ve varsa `gh pr list`.
2. Commit'lenmemiş değişiklik varsa: PR'a hazır mı diye sor. Hazır değilse
   `wip/<yer>-<YYYY-MM-DD>` dalına commit'leyip push et (yer = iş veya ev). `wip/` dalları
   kapılardan muaf ve `main`'e merge edilmez.
3. `HANDOFF.md`'yi **üzerine yazarak** güncelle. Mevcut bölüm başlıklarını koru. Kurallar:
   - "Sıradaki tek iş" **tek maddedir.** Beş maddelik liste devir değil, dağılmış bir gündür.
     Birden fazla iş varsa en önemlisini seç, kalanını issue'ya çevirmeyi öner.
   - Bitmemiş iş için tam olarak nerede kalındığını yaz: dosya, fonksiyon, ve neyin çalışmadığı.
   - Tuzaklar bölümüne yalnızca bugün öğrenilen ve yarın işe yarayacak şeyleri yaz.
   - Uydurma. Bilmediğin bir durumu "muhtemelen" diye yazmak yerine boş bırak.
4. Bugün **kalıcı** bir karar alındıysa (mimari, stack, tasarım) `docs/architecture.md` §9'daki karar
   kaydına satır ekle. `HANDOFF.md` geçici durum tutar, kalıcı karar tutmaz.
5. `docs:` önekli bir commit ile push et.
6. Son olarak, sohbete yapıştırılabilecek **kısa** bir özet yaz (10 satırı geçmesin): hangi dal,
   hangi PR'lar açık, sıradaki tek iş. Diğer hesapta bunu yapıştırmak faydalı ama asıl kayıt repoda.
