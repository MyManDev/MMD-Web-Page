import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // V1'de sunucu tarafi hicbir sey yok; out/ dogrudan yayinlanir.
  // architecture.md §6
  output: "export",
  // Statik export runtime goruntu optimizasyonu desteklemiyor.
  images: { unoptimized: true },
};

export default nextConfig;
