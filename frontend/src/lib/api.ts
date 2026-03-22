/**
 * Canlı (Vercel) için NEXT_PUBLIC_API_URL kullanın, örn:
 * https://smartstock-production-49c7.up.railway.app/api
 * Lokal: http://127.0.0.1:8000/api
 */
const FALLBACK_API =
  "https://smartstock-production-49c7.up.railway.app/api";

/**
 * Ortam değişkeni veya eski kodda kalmış http://smartstock... ifadelerini
 * kesin olarak https ile değiştirir (Mixed Content).
 */
function forceHttpsSmartstock(url: string): string {
  return url.replace(/http:\/\/smartstock/gi, "https://smartstock");
}

function normalizeApiBase(url: string): string {
  let u = forceHttpsSmartstock(url).trim().replace(/\/+$/, "");
  // Mixed content: Vercel'de yanlışlıkla http:// yazılmış production URL'lerini https yap
  if (u.startsWith("http://")) {
    const host = u.slice("http://".length).split("/")[0] ?? "";
    const isLocal =
      host.startsWith("127.0.0.1") || host.startsWith("localhost");
    if (!isLocal) {
      u = `https://${u.slice("http://".length)}`;
    }
  }
  // Son emniyet: Railway host'ları asla http kalmasın (Vercel env typo)
  if (u.includes("up.railway.app") && u.startsWith("http://")) {
    u = `https://${u.slice("http://".length)}`;
  }
  return u;
}

const raw = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL || FALLBACK_API
);

/** Sonunda / olmadan, /api ile biten API kökü */
export const API_URL = raw;

/**
 * API kökü + yol. Path sonundaki gereksiz / kaldırılır (FastAPI 307 önlemi).
 * Ör: apiUrl("/urunler")
 */
export function apiUrl(path: string): string {
  let p = path.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  return `${API_URL}${p}`;
}

/** /uploads gibi /api dışı yollar için backend kökü */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Tam URL görsellerde backend bazen http döndürür; Vercel'de mixed content olur.
 * Localhost/127.0.0.1 hariç http → https.
 */
export function ensureHttpsUnlessLocal(url: string): string {
  let u = forceHttpsSmartstock(url);
  if (!u.startsWith("http://")) return u;
  const host = u.slice("http://".length).split("/")[0] ?? "";
  const isLocal =
    host.startsWith("127.0.0.1") || host.startsWith("localhost");
  if (isLocal) return u;
  return `https://${u.slice("http://".length)}`;
}
