---
description: Kapıları koştur ve çıktıyı olduğu gibi göster
---

`pnpm gates` komutunu koştur.

Kurallar:

- Çıktıyı **olduğu gibi** göster. "Testler geçti" beyanı bir ölçüm değil; sonucu insan okur.
- Bir kapı düşerse durma noktasını ve tam hata metnini ver, sonra en küçük düzeltmeyi öner.
- Bir testi veya lint kuralını devre dışı bırakarak kapıyı geçme. Şemayı `.optional()` ekleyerek
  gevşetme. Kapı düşüyorsa sebep koddadır.
- Kapı çıktısını PR gövdesinin "Nasıl kontrol edildi" bölümüne özetle.
