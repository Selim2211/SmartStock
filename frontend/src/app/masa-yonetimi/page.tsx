"use client";

import { useEffect, useState } from "react";

type Table = {
  id: number;
  name: string;
  capacity: number;
  status: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

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
      const res = await fetch(`${API_BASE}/api/masalar/`);
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
      const res = await fetch(`${API_BASE}/api/masalar/`, {
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

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            Masa Yönetimi
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Salon, bahçe ve teras masalarını tek ekran üzerinden yönetin.
          </p>
        </div>

        {toast && (
          <div className="rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.45)]">
            {toast}
          </div>
        )}
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Yeni Masa Ekle Formu */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">
              Yeni Masa Ekle
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Bahçe, salon veya terastaki masalarınızı isimlendirerek kapasite
              bilgileriyle birlikte kaydedin.
            </p>
          </div>
      </div>

        <form
          className="grid gap-5 md:grid-cols-[2fr,1fr,auto]"
          onSubmit={handleSubmit}
        >
          {/* Masa Adı */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              Masa Adı / Numarası
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Bahçe-1, Salon-5"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner shadow-black/40 outline-none ring-0 transition hover:border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/60"
            />
          </div>

          {/* Kapasite */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              Kapasite (Kişi)
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner shadow-black/40 outline-none ring-0 transition hover:border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/60"
              placeholder="Örn: 4"
            />
          </div>

          {/* Kaydet butonu */}
          <div className="flex items-end justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_22px_rgba(245,158,11,0.8)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {submitting ? "Kaydediliyor..." : "Masayı Kaydet"}
            </button>
          </div>
        </form>
      </section>

      {/* Masa Grid Görünümü */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-[0_0_35px_rgba(0,0,0,0.6)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">
              Mevcut Masalar
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Masalara hızlıca durum atayın, düzenleyin veya sistemden kaldırın.
            </p>
          </div>
          <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400 ring-1 ring-zinc-800">
            Toplam masa:{" "}
            <span className="font-semibold text-zinc-100">
              {tables.length}
            </span>
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            <div className="col-span-full px-2 py-4 text-sm text-zinc-400">
              Masalar yükleniyor...
            </div>
          ) : tables.length === 0 ? (
            <div className="col-span-full px-2 py-4 text-sm text-zinc-400">
              Henüz kayıtlı masa yok. Yukarıdan ilk masayı ekleyin.
            </div>
          ) : (
            tables.map((table) => {
              const statusKey = table.status || "available";
              const label = statusLabel[statusKey] ?? statusKey;
              const statusColor =
                statusKey === "available"
                  ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/40"
                  : statusKey === "occupied"
                  ? "bg-red-500/10 text-red-300 ring-red-500/40"
                  : "bg-amber-500/10 text-amber-300 ring-amber-500/40";

              return (
                <article
                  key={table.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950/90 to-zinc-900/80 p-4 shadow-[0_0_28px_rgba(0,0,0,0.7)] transition hover:border-amber-500/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.35)]"
                >
                  <header className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-50">
                        {table.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Kapasite:{" "}
                        <span className="font-medium text-zinc-200">
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
                        className="inline-flex items-center rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-[11px] font-medium text-zinc-100 transition hover:border-amber-500/70 hover:bg-zinc-900 hover:text-amber-200"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-200 transition hover:bg-red-500/20 hover:border-red-400"
                      >
                        Sil
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-600">
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

