/**
 * Marka isaretinin SVG'sini uretir. #18
 *
 * Elimizdeki orijinal 400x400 bir PNG - sahibi dogruladi, baska bir vektor
 * kaynagi YOK. Yani SVG turetilecek, ve turetilmis bir varligin tek durust
 * hali olculmus olanidir. Script iki olcum birden basiyor:
 *
 *   1. GEOMETRIK sapma - sadelestirilmis dongunun ham konturdan uzakligi.
 *      Asil sayi bu; dogrudan hata sinirini veriyor.
 *   2. Piksel karsilastirmasi - cikti render edilip kaynakla ortusturuluyor.
 *
 * Ikincisi tek basina YETMIYOR ve bu olculdu: epsilon 0.05'ten 0.8'e cikarken
 * piksel farki degismiyor (hepsinde ~%0.25), cunku o fark sadelestirmeden
 * degil kenar yumusatmasindan geliyor. Ona bakip esik secmek olcmeden secmek
 * olurdu.
 *
 * IKI ayri cikti var ve ikisi de gerekli:
 *   public/logo.svg      - markanin tamami: zemin karesi + isaret
 *   public/logo-mark.svg - yalnizca isaret, zemini saydam
 *
 * Ikincisi Hero'daki maske icin sart: `mask-image` alfa kanalini okur, yani
 * zemini dolu bir dosya maske olarak kullanildiginda dolu bir KARE verir.
 *
 * Ikisi de `public/logo*` altinda - NOTICE tam bu yollari sayiyor. Onceki
 * `public/brand/mark.png` o listenin disinda kaliyordu.
 *
 * YONTEM
 *
 * Uc kafa DAIRE ve bu olculdu, varsayilmadi: kutulari 53-54px kare ve
 * alanlari pi*r^2 ile birebir ortusuyor. Onlar `<circle>` olarak yaziliyor.
 *
 * Govde izleniyor. Kullanilan sey marching squares: alfa alanini 0.5
 * esiginde kesip ara degerle konum buluyor, yani kenar yumusatmasindan
 * ALT PIKSEL dogruluk cikariyor. Piksel siniri izlemek (Moore) tam sayi
 * koordinat verir ve buyutuldugunde merdiven gorunur.
 *
 * Sonra Douglas-Peucker ile sadelestiriliyor. Esik bir takas: kucuk esik daha
 * cok nokta ve daha buyuk dosya, buyuk esik daha az nokta ve daha cok sapma.
 * Deger tahminle degil olcumle secildi - script sapmayi basiyor.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const SOURCE = "assets/brand/logo.png";
const ISO = 0.5;
/**
 * Douglas-Peucker esigi, piksel - ve dogrudan HATA SINIRI: olculdu, en kotu
 * sapma her esikte tam olarak esigin kendisi cikiyor.
 *
 * 0.1 secildi cunku kaynak 400px ve isaret en fazla ~2000px'te gosterilirse
 * hata orada bile 0.5px'in altinda kaliyor. Daha buyuk esikler dosyayi
 * kuculturdu (0.8 -> 1.0 KB) ama 2000px'te 4px hata demek olurdu; kazanc
 * birkac KB, bedeli gorunur bir bozulma.
 */
const EPSILON = 0.1;

/** Kaynagi alfa maskesine cevirir - extract-mark.mjs ile ayni renk mesafesi. */
async function readMask({ dataUrl }) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d context alinamadi");
  context.drawImage(image, 0, 0);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  const span = Math.hypot(255 - bgR, 255 - bgG, 255 - bgB);
  const soft = span * 0.5;

  const alpha = [];
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.hypot(data[i] - bgR, data[i + 1] - bgG, data[i + 2] - bgB);
    alpha.push(Math.round(Math.max(0, Math.min(1, distance / soft)) * 255));
  }

  return {
    width: canvas.width,
    height: canvas.height,
    alpha,
    background: "rgb(" + bgR + ", " + bgG + ", " + bgB + ")",
  };
}

/** 4-yonlu baglantili bilesenler; kafalari govdeden ayirmak icin. */
function components(alpha, W, H) {
  const seen = new Uint8Array(W * H);
  const found = [];
  const on = (i) => alpha[i] >= ISO * 255;

  for (let start = 0; start < W * H; start++) {
    if (!on(start) || seen[start]) continue;
    let minX = W;
    let maxX = -1;
    let minY = H;
    let maxY = -1;
    let area = 0;
    const pixels = [];
    const stack = [start];
    seen[start] = 1;

    while (stack.length) {
      const k = stack.pop();
      const x = k % W;
      const y = (k / W) | 0;
      area++;
      pixels.push(k);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const step of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + step[0];
        const ny = y + step[1];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx;
        if (!seen[ni] && on(ni)) {
          seen[ni] = 1;
          stack.push(ni);
        }
      }
    }
    found.push({ minX, maxX, minY, maxY, area, pixels });
  }
  return found;
}

/** Marching squares, ara degerli. Kapali dongu listesi dondurur. */
function contours(field, W, H) {
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : field[y * W + x]);
  const lerp = (p, q, a, b) => {
    const t = (ISO - a) / (b - a);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  };
  const key = (point) => point[0].toFixed(3) + "," + point[1].toFixed(3);
  const next = new Map();

  for (let y = -1; y < H; y++) {
    for (let x = -1; x < W; x++) {
      const a = at(x, y);
      const b = at(x + 1, y);
      const c = at(x + 1, y + 1);
      const d = at(x, y + 1);
      const code =
        (a >= ISO ? 8 : 0) | (b >= ISO ? 4 : 0) | (c >= ISO ? 2 : 0) | (d >= ISO ? 1 : 0);
      if (code === 0 || code === 15) continue;

      const top = () => lerp([x, y], [x + 1, y], a, b);
      const right = () => lerp([x + 1, y], [x + 1, y + 1], b, c);
      const bottom = () => lerp([x + 1, y + 1], [x, y + 1], c, d);
      const left = () => lerp([x, y + 1], [x, y], d, a);

      // Ic kisim SAGDA kalacak sekilde yonlu kenarlar.
      const table = {
        1: [[bottom, left]],
        2: [[right, bottom]],
        3: [[right, left]],
        4: [[top, right]],
        5: [
          [top, left],
          [right, bottom],
        ],
        6: [[top, bottom]],
        7: [[top, left]],
        8: [[left, top]],
        9: [[bottom, top]],
        10: [
          [left, bottom],
          [right, top],
        ],
        11: [[right, top]],
        12: [[left, right]],
        13: [[bottom, right]],
        14: [[left, bottom]],
      };

      for (const edge of table[code]) {
        const from = edge[0]();
        const to = edge[1]();
        next.set(key(from), { from, to });
      }
    }
  }

  const loops = [];
  const used = new Set();
  for (const entry of next) {
    const startKey = entry[0];
    if (used.has(startKey)) continue;
    const loop = [];
    let cursor = startKey;
    let guard = 0;
    while (next.has(cursor) && !used.has(cursor) && guard++ < 1e6) {
      used.add(cursor);
      const step = next.get(cursor);
      loop.push(step.from);
      cursor = key(step.to);
    }
    if (loop.length > 8) loops.push(loop);
  }
  return loops;
}

/** Douglas-Peucker. Kapali dongude ilk ve son nokta korunur. */
function simplify(points, epsilon) {
  if (points.length < 3) return points;

  const distance = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
  };

  // Ozyineleme DEGIL yigin: 30 bin noktali bir dongude ozyineleme yigini tasiyor.
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const range = stack.pop();
    const from = range[0];
    const to = range[1];
    let worst = 0;
    let index = -1;
    for (let i = from + 1; i < to; i++) {
      const d = distance(points[i], points[from], points[to]);
      if (d > worst) {
        worst = d;
        index = i;
      }
    }
    if (worst > epsilon && index > from) {
      keep[index] = 1;
      stack.push([from, index], [index, to]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

const round = (n) => Number(n.toFixed(2));

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const bytes = await readFile(SOURCE);
  const dataUrl = "data:image/png;base64," + bytes.toString("base64");
  const mask = await page.evaluate(readMask, { dataUrl });

  const W = mask.width;
  const H = mask.height;
  const background = mask.background;
  const alpha = Uint8Array.from(mask.alpha);

  const parts = components(alpha, W, H);
  const heads = parts.filter((c) => c.maxY < H / 2).sort((a, b) => a.minX - b.minX);
  const bodies = parts.filter((c) => !heads.includes(c));
  if (heads.length !== 3) throw new Error("3 kafa bekleniyordu, " + heads.length + " bulundu");
  if (bodies.length !== 1) throw new Error("tek govde bekleniyordu, " + bodies.length + " bulundu");

  const circles = heads.map((h) => ({
    cx: round((h.minX + h.maxX + 1) / 2),
    cy: round((h.minY + h.maxY + 1) / 2),
    // Yaricap ALANDAN: kutu tek pikselde sasabilir, alan 2000+ piksele yayilir.
    r: round(Math.sqrt(h.area / Math.PI)),
    fromBox: (h.maxX - h.minX + 1) / 2,
  }));

  // Govde alanini yalniz basina birak; kafalar contour'a karismasin.
  const bodyField = new Float32Array(W * H);
  for (const i of bodies[0].pixels) bodyField[i] = alpha[i] / 255;

  const raw = contours(bodyField, W, H);
  const loops = raw.map((loop) => simplify(loop, EPSILON)).sort((a, b) => b.length - a.length);

  /*
    GEOMETRIK SAPMA - ve asil sayi bu.

    Once sadeleistirilmis sekli render edip kaynakla piksel karsilastirmasi
    yapiyordum; sonuc epsilon 0.05 ile 0.8 arasinda DEGISMIYORDU (hepsinde
    ~%0.25). Yani o olcum sadeleistirme hatasini degil, kenar yumusatmasinin
    kendisini olcuyordu - duyarsiz bir metrik, ve ona bakip esik secmek
    olcmeden secmek olurdu.

    Burada olculen sey dogrudan sozlesme: sadeleistirilmis dongudeki her nokta,
    sadeleistirilmemis konturdan ne kadar sapti. Douglas-Peucker bunu epsilon
    ile sinirlamayi vaat ediyor; vaadi kontrol ediyoruz.
  */
  const deviation = raw.map((loop, index) => {
    const simple = loops[index] ?? [];
    let worst = 0;
    let sum = 0;
    for (const point of loop) {
      let best = Infinity;
      for (let i = 0; i < simple.length - 1; i++) {
        const a = simple[i];
        const b = simple[i + 1];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len2 = dx * dx + dy * dy;
        const t =
          len2 === 0
            ? 0
            : Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / len2));
        const d = Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
        if (d < best) best = d;
      }
      if (best > worst) worst = best;
      sum += best;
    }
    return { worst, mean: sum / loop.length, points: loop.length };
  });

  const path = loops
    .map((loop) => "M" + loop.map((p) => round(p[0]) + " " + round(p[1])).join("L") + "Z")
    .join("");

  const heads_svg = (indent) =>
    circles
      .map((c) => indent + '<circle cx="' + c.cx + '" cy="' + c.cy + '" r="' + c.r + '" />')
      .join("\n");

  const markSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    W +
    " " +
    H +
    '" fill="currentColor" role="img" aria-label="MyManDev">\n' +
    heads_svg("  ") +
    '\n  <path d="' +
    path +
    '" />\n</svg>\n';

  const logoSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    W +
    " " +
    H +
    '" role="img" aria-label="MyManDev">\n  <rect width="' +
    W +
    '" height="' +
    H +
    '" fill="' +
    background +
    '" />\n  <g fill="#ffffff">\n' +
    heads_svg("    ") +
    '\n    <path d="' +
    path +
    '" />\n  </g>\n</svg>\n';

  await mkdir("public", { recursive: true });
  await writeFile("public/logo-mark.svg", markSvg);
  await writeFile("public/logo.svg", logoSvg);

  console.log("Kaynak       " + SOURCE + "  " + W + "x" + H);
  console.log("Zemin        " + background);
  for (const c of circles) {
    console.log(
      "Kafa         merkez " +
        c.cx +
        "," +
        c.cy +
        "  yaricap " +
        c.r +
        "  (kutudan " +
        c.fromBox +
        ")",
    );
  }
  console.log(
    "Govde        " +
      loops.length +
      " dongu, " +
      loops.reduce((n, l) => n + l.length, 0) +
      " nokta (epsilon " +
      EPSILON +
      ")",
  );
  console.log("public/logo-mark.svg  " + markSvg.length + " byte");
  console.log("public/logo.svg       " + logoSvg.length + " byte");
  for (const d of deviation) {
    console.log(
      "Geometrik sapma  en kotu " +
        d.worst.toFixed(3) +
        "px  ortalama " +
        d.mean.toFixed(3) +
        "px  (" +
        d.points +
        " ham nokta)",
    );
  }

  // --- DOGRULAMA: kendi ciktisini render et, kaynakla karsilastir.
  const verify = await page.evaluate(
    async (input) => {
      const draw = async (source) => {
        const img = new Image();
        img.src = source;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = input.W;
        c.height = input.H;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0, input.W, input.H);
        return g.getImageData(0, 0, input.W, input.H).data;
      };

      const mine = await draw("data:image/svg+xml;base64," + btoa(input.svg));
      const theirs = await draw(input.src);

      // Kaynakta zemin dolu, SVG maskesinde saydam - ikisi de ALFA'ya indirgeniyor.
      const bg = [theirs[0], theirs[1], theirs[2]];
      const span = Math.hypot(255 - bg[0], 255 - bg[1], 255 - bg[2]) * 0.5;
      let differing = 0;
      let total = 0;
      let sum = 0;

      for (let i = 0; i < mine.length; i += 4) {
        const a = mine[i + 3] / 255;
        const dist = Math.hypot(theirs[i] - bg[0], theirs[i + 1] - bg[1], theirs[i + 2] - bg[2]);
        const b = Math.max(0, Math.min(1, dist / span));
        const d = Math.abs(a - b);
        sum += d;
        total++;
        if (d > 0.5) differing++;
      }
      return { differing, total, mean: sum / total };
    },
    { svg: markSvg, src: dataUrl, W, H },
  );

  const pct = (verify.differing / verify.total) * 100;
  console.log("");
  console.log(
    "DOGRULAMA    " +
      verify.differing +
      " / " +
      verify.total +
      " piksel ayriliyor  (%" +
      pct.toFixed(4) +
      ")",
  );
  console.log("             ortalama alfa sapmasi " + verify.mean.toFixed(5));
} finally {
  await browser.close();
}
