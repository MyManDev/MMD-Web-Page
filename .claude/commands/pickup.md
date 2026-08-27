---
description: Gün başı — devir kaydını oku, planı söyle, onay bekle
---

Bu hesapta işe yeni başlıyorum. Diğer hesapta bırakılan işi devral.

Adımlar:

1. `git pull` ile güncelle.
2. **Oku:** `HANDOFF.md`, sonra `CLAUDE.md`. Mimari veya süreç sorusu doğarsa
   `docs/architecture.md` ve `docs/working-agreement.md`.
3. Durumu koda karşı **doğrula, inanma**: `git status`, `git log --oneline -10`,
   `git branch -a`, varsa `gh pr list`. `HANDOFF.md`'deki iddialar ile gerçek durum çelişiyorsa
   **git doğrudur**, dosya bayattır — çelişkiyi bana söyle.
4. `wip/` dalı varsa haber ver ve düzgün bir `feature/` dalına toplamayı öner.
5. Sıradaki tek işi al ve **planı yaz**: hangi dosyalar, hangi bölge, hangi sırayla, hangi kapıyla
   doğrulanacak. Paylaşılan yüzeye dokunuyorsa bunu ayrıca söyle.
6. **Onay almadan hiçbir dosyayı değiştirme.**

Sohbete bir özet yapıştırıldıysa onu ek bağlam olarak kullan, ama repo ile çelişirse repoyu esas al.
