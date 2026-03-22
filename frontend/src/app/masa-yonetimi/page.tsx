"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Table = {
  id: number;
  name: string;
  capacity: number;
  status: string;
};

export default function MasaYonetimiPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");

  async function fetchTables() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/masalar/`);
      if (!res.ok) {
        throw new Error("Masalar alınırken hata oluştu");
      }
      const data = (await res.json()) as Table[];
      setTables(data);
    } catch (err) {
      console.error(err);
      setError("Masaları çekerken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTables();
  }, []);

  function resetForm() {
    setName("");
    setCapacity("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (!name || capacity === "") {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/masalar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Masa eklenemedi.");
      }

      await fetchTables();
      resetForm();
      setToast("Masa başarıyla eklendi.");
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Masa kaydedilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel: Record<string, string> = {
    available: "Müsait",
    occupied: "Dolu",
    reserved: "Rezerve",
  };

  const cardShell =
    "rounded-2xl border border-espresso-border bg-[#f8f3ea] p-6 shadow-sm dark:bg-espresso-surface/90 dark:shadow-[0_0_40px_rgba(0,0,0,0.35)]";

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-espresso dark:text-espresso-cream">
            Masa Yönetimi
          </h1>
          <p className="mt-1 text-sm text-espresso/75 dark:text-espresso-muted">
            Salon, bahçe ve teras masalarını tek ekran üzerinden yönetin.
          </p>
        </div>

        {toast && (
          <div className="rounded-xl bg-emerald-800/20 px-4 py-2 text-xs font-medium text-emerald-100 ring-1 ring-emerald-600/40">
            {toast}
          </div>
        )}
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      <section className={cardShell}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
              Yeni Masa Ekle
            </h2>
            <p className="mt-1 text-xs text-espresso/70 dark:text-espresso-muted">
              Bahçe, salon veya terastaki masalarınızı isimlendirerek kapasite
              bilgileriyle birlikte kaydedin.
            </p>
          </div>
        </div>

        <form
          className="grid gap-5 md:grid-cols-[2fr,1fr,auto]"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
              Masa Adı / Numarası
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Bahçe-1, Salon-5"
              className="w-full rounded-xl border border-espresso-border bg-white/90 px-3 py-2.5 text-sm text-espresso placeholder-espresso/40 shadow-inner outline-none transition hover:border-espresso-latte/50 focus:border-espresso-latte focus:ring-2 focus:ring-espresso-latte/40 dark:bg-espresso-bg/80 dark:text-espresso-cream dark:placeholder-espresso-muted"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
              Kapasite (Kişi)
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-espresso-border bg-white/90 px-3 py-2.5 text-sm text-espresso placeholder-espresso/40 shadow-inner outline-none transition hover:border-espresso-latte/50 focus:border-espresso-latte focus:ring-2 focus:ring-espresso-latte/40 dark:bg-espresso-bg/80 dark:text-espresso-cream dark:placeholder-espresso-muted"
              placeholder="Örn: 4"
            />
          </div>

          <div className="flex items-end justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-espresso-latte px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-espresso-latte-dark disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-espresso-latte focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f3ea] dark:focus-visible:ring-offset-espresso-surface"
            >
              {submitting ? "Kaydediliyor..." : "Masayı Kaydet"}
            </button>
          </div>
        </form>
      </section>

      <section className={cardShell}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
              Mevcut Masalar
            </h2>
            <p className="mt-1 text-xs text-espresso/70 dark:text-espresso-muted">
              Masalara hızlıca durum atayın, düzenleyin veya sistemden kaldırın.
            </p>
          </div>
          <span className="rounded-full border border-espresso-border bg-white/80 px-3 py-1 text-xs text-espresso/75 dark:bg-espresso-bg dark:text-espresso-muted">
            Toplam masa:{" "}
            <span className="font-semibold text-espresso dark:text-espresso-cream">
              {tables.length}
            </span>
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full px-2 py-4 text-sm text-espresso/65 dark:text-espresso-muted">
              Masalar yükleniyor...
            </div>
          ) : tables.length === 0 ? (
            <div className="col-span-full px-2 py-4 text-sm text-espresso/65 dark:text-espresso-muted">
              Henüz kayıtlı masa yok. Yukarıdan ilk masayı ekleyin.
            </div>
          ) : (
            tables.map((table) => {
              const statusKey = table.status || "available";
              const label = statusLabel[statusKey] ?? statusKey;
              const statusColor =
                statusKey === "available"
                  ? "bg-emerald-900/30 text-emerald-200 ring-emerald-700/50"
                  : statusKey === "occupied"
                  ? "bg-red-900/30 text-red-200 ring-red-700/50"
                  : "bg-amber-900/30 text-amber-200 ring-amber-700/50";

              return (
                <article
                  key={table.id}
                  className="group flex flex-col justify-between rounded-2xl border border-espresso-border bg-white/90 p-4 shadow-md transition hover:border-espresso-latte/40 dark:bg-espresso-bg/90"
                >
                  <header className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-espresso dark:text-espresso-cream">
                        {table.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-espresso/65 dark:text-espresso-muted">
                        Kapasite:{" "}
                        <span className="font-medium text-espresso dark:text-espresso-cream">
                          {table.capacity} kişi
                        </span>
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ring-1 ${statusColor}`}
                    >
                      {label}
                    </span>
                  </header>

                  <footer className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-espresso-border bg-white/80 px-3 py-1.5 text-[11px] font-medium text-espresso transition hover:border-espresso-latte hover:text-espresso-latte-dark dark:bg-espresso-surface dark:text-espresso-cream dark:hover:text-espresso-cream"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-700 transition hover:bg-red-500/20 dark:text-red-300"
                      >
                        Sil
                      </button>
                    </div>
                    <span className="text-[10px] text-espresso/45 dark:text-espresso-muted">
                      ID: {table.id.toString().padStart(3, "0")}
                    </span>
                  </footer>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
