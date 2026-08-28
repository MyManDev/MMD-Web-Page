import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // V1'de sunucu tarafi hicbir sey yok; out/ dogrudan yayinlanir.
  // architecture.md §6
  output: "export",
  // Statik export runtime goruntu optimizasyonu desteklemiyor.
  images: { unoptimized: true },
  /**
   * `next dev` varsayilan olarak CLAUDE.md'ye kendi blogunu ekliyor.
   * KAPATILDI: CLAUDE.md paylasilan yuzey ve iki bolge sahibinin onayini
   * ister (working-agreement.md §1). Bir aracin oraya kendiliginden yazmasi
   * o onayi atlar; ustelik eklenen metin "bunu isinle birlikte commit et"
   * diyor, yani calisma agacini kirletip commit'e sizmayi kolaylastiriyor.
   *
   * Kural hala gecerli: CLAUDE.md elle yazilir.
   */
  agentRules: false,
};

export default nextConfig;
