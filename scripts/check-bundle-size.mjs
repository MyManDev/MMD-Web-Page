#!/usr/bin/env node
/**
 * Payload kapisi. docs/architecture.md §8
 *
 * SAYFA BASINA olcer: out/ altindaki her HTML sayfasi icin, o sayfanin
 * yukledigi benzersiz JS dosyalarinin gzip'lenmis toplami. Sayfalarin en
 * buyugu esigi asarsa sifirdan farkli kod doner.
 *
 * Neden sayfa basina: esigin cevapladigi soru "kullanici bu sayfayi actiginda
 * ne kadar JS iniyor?". Dizin toplami bu soruyu cevaplamaz ve route sayisiyla
 * buyudugu icin esik zamanla anlamini yitirirdi.
 *
 * Yalnizca out/'a bakar; build manifest'ine bagimli degildir.
 */
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix, relative, resolve } from "node:path";

const OUT = resolve("out");
const LIMIT_BYTES = 150 * 1024; // 150 KiB

/** out/ altindaki tum dosyalari mutlak yol olarak dondurur. */
function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

/**
 * Bir HTML'in yukledigi JS yollarini toplar: <script src> ve JS preload'lari.
 *
 * `nomodule` script'leri AYRI dondurulur ve esige sayilmaz: modern tarayicilar
 * onlari hic indirmiyor, yalnizca eski tarayicilar indiriyor. Esigin sordugu
 * soru "kullanici bu sayfayi actiginda ne kadar JS iniyor" oldugu icin bunlari
 * toplama katmak olcumu kendi tanimina aykiri hale getirirdi. Yine de gorunur
 * kalsinlar diye raporda ayri satirda yazilirlar.
 */
function referencedScripts(html) {
  const refs = new Set();
  const legacy = new Set();

  for (const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    if (/\bnomodule\b/i.test(m[0])) legacy.add(m[1]);
    else refs.add(m[1]);
  }
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\brel=["'](?:preload|modulepreload)["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i);
    if (!href) continue;
    const isScript = /\bas=["']script["']/i.test(tag) || /\brel=["']modulepreload["']/i.test(tag);
    if (isScript || href[1].endsWith(".js")) refs.add(href[1]);
  }

  return { refs: [...refs], legacy: [...legacy] };
}

/** Sayfa-goreli veya kok-goreli bir referansi out/ altinda bir dosyaya cozer. */
function resolveRef(ref, pagePath) {
  if (/^[a-z]+:\/\//i.test(ref) || ref.startsWith("//")) return null; // dis kaynak
  const clean = ref.split("?")[0].split("#")[0];
  if (!clean.endsWith(".js")) return null;
  const full = clean.startsWith("/") ? join(OUT, clean) : resolve(join(pagePath, ".."), clean);
  return full.startsWith(OUT) ? full : null;
}

const files = walk(OUT);
const htmlPages = files.filter((f) => f.endsWith(".html"));

if (htmlPages.length === 0) {
  console.error("HATA: out/ altinda HTML sayfasi yok. Once `pnpm build` kosun.");
  process.exit(1);
}

const gzipCache = new Map();
function gzipSize(file) {
  if (!gzipCache.has(file)) {
    try {
      gzipCache.set(file, gzipSync(readFileSync(file)).length);
    } catch {
      gzipCache.set(file, null); // referans var, dosya yok
    }
  }
  return gzipCache.get(file);
}

const results = [];
const missing = [];

for (const page of htmlPages) {
  const html = readFileSync(page, "utf8");
  const { refs, legacy } = referencedScripts(html);

  const collect = (list) => {
    const files = new Set();
    for (const ref of list) {
      const file = resolveRef(ref, page);
      if (file) files.add(file);
    }
    let total = 0;
    for (const file of files) {
      const size = gzipSize(file);
      if (size === null) missing.push(`${relative(OUT, page)} -> ${relative(OUT, file)}`);
      else total += size;
    }
    return { count: files.size, bytes: total };
  };

  const modern = collect(refs);
  const legacyOnly = collect(legacy);

  results.push({
    page: posix.join("/", relative(OUT, page).split(/[\\/]/).join("/")),
    files: modern.count,
    bytes: modern.bytes,
    legacyBytes: legacyOnly.bytes,
  });
}

results.sort((a, b) => b.bytes - a.bytes);

const kib = (n) => `${(n / 1024).toFixed(1)} KiB`;
const width = Math.max(...results.map((r) => r.page.length));

console.log(`Payload kapisi - sayfa basina JS (gzip), esik ${kib(LIMIT_BYTES)}\n`);
for (const r of results) {
  const flag = r.bytes > LIMIT_BYTES ? "FAIL" : "ok";
  const legacy = r.legacyBytes > 0 ? `  (+ ${kib(r.legacyBytes)} nomodule, sayilmiyor)` : "";
  console.log(
    `  ${r.page.padEnd(width)}  ${kib(r.bytes).padStart(10)}  ${r.files} dosya  ${flag}${legacy}`,
  );
}

if (missing.length > 0) {
  console.error(`\nHATA: HTML'de referans verilen ${missing.length} JS dosyasi out/ altinda yok:`);
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}

const worst = results[0];
console.log(`\nEn agir sayfa: ${worst.page} - ${kib(worst.bytes)} / ${kib(LIMIT_BYTES)}`);

if (worst.bytes > LIMIT_BYTES) {
  console.error(
    `\nKAPI DUSTU: ${worst.page} esigi ${kib(worst.bytes - LIMIT_BYTES)} asiyor.\n` +
      `Esigi yukseltmek bir cozum degil - once ne eklendigine bakin (architecture.md §8).`,
  );
  process.exit(1);
}

console.log("Kapi gecti.");
