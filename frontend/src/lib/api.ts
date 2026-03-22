/**
 * Canlı (Vercel) için NEXT_PUBLIC_API_URL kullanın, örn:
 * https://smartstock-production-49c7.up.railway.app/api
 * Lokal: http://127.0.0.1:8000/api
 */
const raw =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smartstock-production-49c7.up.railway.app/api";

/** Sonunda / olmadan, /api ile biten API kökü */
export const API_URL = raw.replace(/\/+$/, "");

/** /uploads gibi /api dışı yollar için backend kökü */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
