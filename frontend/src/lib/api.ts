/**
 * Canlı (Vercel) için NEXT_PUBLIC_API_URL kullanın, örn:
 * https://smartstock-production-49c7.up.railway.app/api
 * Lokal: http://127.0.0.1:8000/api
 */
const raw =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smartstock-production-49c7.up.railway.app/api";

function normalizeApiBase(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
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

/** Sonunda / olmadan, /api ile biten API kökü */
export const API_URL = normalizeApiBase(raw);

/** /uploads gibi /api dışı yollar için backend kökü */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/**
 * Tam URL görsellerde backend bazen http döndürür; Vercel'de mixed content olur.
 * Localhost/127.0.0.1 hariç http → https.
 */
export function ensureHttpsUnlessLocal(url: string): string {
  if (!url.startsWith("http://")) return url;
  const host = url.slice("http://".length).split("/")[0] ?? "";
  const isLocal =
    host.startsWith("127.0.0.1") || host.startsWith("localhost");
  if (isLocal) return url;
  return `https://${url.slice("http://".length)}`;
}
