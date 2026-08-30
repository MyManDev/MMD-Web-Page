/**
 * OG gorselini uretir - link paylasildiginda cikan 1200x630 kart. #18
 *
 * Kart SITENIN KENDISINDEN uretiliyor, elle yeniden kurulmuyor: script
 * `out/` altindaki gercek sayfayi aciyor, govdeyi kart bilesimiyle
 * degistiriyor ve ekran goruntusunu aliyor.
 *
 * Sebep tek kayit kurali. Karti ayri bir HTML dosyasi olarak yazsaydim
 * renkleri ve fontu ORAYA IKINCI KEZ yazmam gerekirdi; token bir gun
 * degistiginde OG gorseli sessizce eski markayi gostermeye devam ederdi.
 * Boyle kurulunca kart `--color-page`, `--color-accent` ve sayfanin kendi
 * font degiskenlerini okuyor - kaynak tek.
 *
 * Amblem `mask-image` ile boyaniyor, `<img>` olarak degil: rengi yine
 * token'dan geliyor. `public/logo.svg`'yi dogrudan koymak markanin dolu
 * turkuaz karesini basardi.
 *
 * ONKOSUL: `out/` var olmali (`pnpm build`). Cikti `public/og.png` ve o da
 * bir sonraki build'de `out/`a kopyalaniyor - yani gorseli degistirdikten
 * sonra bir kez daha build almak gerekiyor.
 */
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { chromium } from "@playwright/test";

const OUTPUT = "public/og.png";
const PORT = 4178;
const WIDTH = 1200;
const HEIGHT = 630;

try {
  await access("out/index.html");
} catch {
  throw new Error("out/ yok - once `pnpm build` calistir.");
}

/*
  Sunucu burada aciliyor ve burada kapaniyor. `pnpm preview` bir sunucudur,
  biten bir is degil; arka planda birakilirsa birikiyor.
*/
const server = spawn("npx", ["serve", "out", "-l", String(PORT)], {
  shell: true,
  stdio: "ignore",
});
const stop = () => {
  server.kill();
  spawn("taskkill", ["/F", "/T", "/PID", String(server.pid)], { shell: true, stdio: "ignore" });
};

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    // Cikti 1200x630 OLMALI - OG kartlari bu olcuyu bekliyor.
    deviceScaleFactor: 1,
  });

  /*
    Denemeler arasinda BEKLEME sart. Baglanti reddedildiginde `goto` zaman
    asimini beklemeden aninda atiyor, yani beklemesiz bir dongu 80 denemeyi
    bir saniyede tuketip sunucu ayaga kalkmadan pes ediyor. Olculdu - ilk
    surum tam olarak boyle dustu.
  */
  let ready = false;
  for (let attempt = 0; attempt < 60 && !ready; attempt++) {
    try {
      await page.goto(`http://localhost:${PORT}/`, { timeout: 2000 });
      ready = true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  if (!ready) throw new Error("sunucu ayaga kalkmadi");

  // Fontlar inmeden ekran goruntusu alinirsa wordmark yedek fontla cizilir.
  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(
    ({ width, height }) => {
      document.body.innerHTML = "";
      document.body.style.margin = "0";

      const card = document.createElement("div");
      card.id = "og";
      Object.assign(card.style, {
        width: `${width}px`,
        height: `${height}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
        backgroundColor: "var(--color-page)",
      });

      const mark = document.createElement("div");
      Object.assign(mark.style, {
        width: "232px",
        height: "232px",
        backgroundColor: "var(--color-accent)",
        maskImage: 'url("/logo-mark.svg")',
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      });

      const wordmark = document.createElement("p");
      wordmark.textContent = "MyManDev";
      Object.assign(wordmark.style, {
        margin: "0",
        fontFamily: "var(--font-mono)",
        fontSize: "64px",
        fontWeight: "500",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-text)",
      });

      card.append(mark, wordmark);
      document.body.append(card);
    },
    { width: WIDTH, height: HEIGHT },
  );

  await page.waitForTimeout(300);
  const buffer = await page.locator("#og").screenshot({ path: OUTPUT });

  const measured = await page.locator("#og").evaluate((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const word = el.querySelector("p");
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      background: style.backgroundColor,
      font: getComputedStyle(word).fontFamily,
      accent: getComputedStyle(el.querySelector("div")).backgroundColor,
    };
  });

  console.log(`${OUTPUT}  ${measured.width}x${measured.height}  ${buffer.length} byte`);
  console.log(`Zemin   ${measured.background}   (--color-page)`);
  console.log(`Accent  ${measured.accent}   (--color-accent)`);
  console.log(`Font    ${measured.font}`);

  if (measured.width !== WIDTH || measured.height !== HEIGHT) {
    throw new Error(`olcu ${measured.width}x${measured.height}, ${WIDTH}x${HEIGHT} olmaliydi`);
  }
  if (!/plex/i.test(measured.font)) {
    // Yedek fontla cizilmis bir kart sessizce yanlis marka gosterir.
    throw new Error(`wordmark site fontuyla cizilmedi: ${measured.font}`);
  }
} finally {
  await browser.close();
  stop();
}
