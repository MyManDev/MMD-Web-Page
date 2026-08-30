import { z } from "zod";

/**
 * Icerik semasi. PAYLASILAN YUZEY - degisiklik iki bolge sahibinin onayini ister.
 * docs/working-agreement.md §1
 *
 * Sema SERTTIR. Alan eksik veya yanlissa `pnpm build` patlar. Alan default'a
 * dusmez, kart placeholder gostermez, `.optional()` eklenerek hata susturulmaz.
 * Sessizce yanlis olmaktansa reddet. docs/architecture.md §5
 */

const httpsUrl = z.url({ protocol: /^https$/ });

/** Proje kaydi. Zorunlu alanlar architecture.md §5'te sayili. */
export const projectSchema = z.object({
  /** /projects/[slug] route'lari sonradan semayi degistirmeden eklenebilsin diye. */
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug kebab-case olmali"),
  name: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  repoUrl: httpsUrl,
  /** public/ altinda, elle uretilmis webp. Yoksa kart yayinlanmaz. */
  screenshot: z.string().min(1).startsWith("/"),
  order: z.number().int().nonnegative(),

  liveUrl: httpsUrl.optional(),
  /** Imza ogesi - durust sayi. architecture.md §4.6 */
  metrics: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .optional(),
});

export const teamMemberSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug kebab-case olmali"),
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  githubUrl: httpsUrl,
  order: z.number().int().nonnegative(),
});

/**
 * Marka, metin ve navigasyon.
 *
 * `description`, `hero` ve `whoWeAre` #15'te yazildi ve buraya ZORUNLU alan
 * olarak girdi - `.optional()` degil. Metin silinirse `pnpm build` patlar;
 * istenen de bu (CLAUDE.md kural 7).
 *
 * Olcu belgede DEGIL burada zorlaniyor: `principles` 3-5 madde alir, cunku
 * design-spec.md §3.4 boyle diyor - ve uygulanan bir kural, yazili bir
 * kuraldan daha uzun yasar.
 */
export const siteSchema = z.object({
  wordmark: z.literal("MyManDev"),
  canonicalUrl: httpsUrl,
  repoUrl: httpsUrl,
  /** SEO aciklamasi. Marka metni - paylasilan karar alani. */
  description: z.string().min(1),
  /** Hero basligi ve alt cumlesi. design-spec.md §3.2 */
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
  }),
  /** Kolektifi birlikte anlatan bolum. design-spec.md §3.4 */
  whoWeAre: z.object({
    manifesto: z.string().min(1),
    principles: z.array(z.string().min(1)).min(3).max(5),
  }),
  /** NOTICE dosyasindaki telif satirinin yili. Footer cumleyi bundan kurar,
      metni ikinci kez yazmaz. */
  copyrightYear: z.number().int(),
  nav: z
    .array(
      z.object({
        id: z.string().min(1),
        number: z.string().regex(/^\d{2}$/, "bolum numarasi iki haneli"),
        label: z.string().min(1),
      }),
    )
    .min(1),
});

export type Project = z.infer<typeof projectSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Site = z.infer<typeof siteSchema>;
