/**
 * `check-commit-trailers.mjs` icin tip bildirimi. Gerekce
 * `lighthouse-summary.d.mts` ile ayni: script derlenmeden node ile calisiyor,
 * testler saf fonksiyonu import ediyor.
 */

/** Bir commit mesajindaki yasak satirlarin nedenleri. Temizse bos liste. */
export function findTrailers(message: string): string[];
