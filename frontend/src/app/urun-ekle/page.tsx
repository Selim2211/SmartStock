"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { API_URL } from "@/lib/api";

const categories = ["Kahveler", "Tatlılar", "Sandviçler", "Soğuk İçecekler"];

export default function UrunEklePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const first = acceptedFiles[0];
    if (!first) return;
    setFile(first);
    setPreviewUrl(URL.createObjectURL(first));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  function resetForm() {
    setName("");
    setCategory("");
    setPrice("");
    setFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (!name || !category || price === "") {
      setError("Lütfen ürün adı, kategori ve fiyat alanlarını doldurun.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", String(price));
      if (file) {
        formData.append("gorsel", file);
      }

      const res = await fetch(`${API_URL}/urunler/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Ürün eklenemedi.");
      }

      resetForm();
      setToast("Ürün başarıyla eklendi.");
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Ürün kaydedilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            Yeni Ürün Ekle
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Ürünün tüm detaylarını ve isteğe bağlı görselini ekleyerek menünüze
            kaydedin.
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        {/* Form */}
        <form
          className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-50">
                Ürün Bilgileri
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Fiyat, stok ve kritik seviye alanları lojistik ve raporlama
                için kullanılır.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Ürün Adı */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                Ürün Adı
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Flat White, Tiramisu, Cold Brew..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-inner shadow-black/40 outline-none ring-0 transition hover:border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/60"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 shadow-inner shadow-black/40 outline-none ring-0 transition hover:border-zinc-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/60"
              >
                <option value="">Kategori seçin</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Fiyat */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                Fiyat (₺)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 shadow-inner shadow-black/40 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/60">
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full bg-transparent text-sm text-zinc-100 outline-none"
                  placeholder="Örn: 85"
                />
                <span className="text-xs font-medium text-zinc-500">₺</span>
              </div>
            </div>

            {/* Diğer lojistik alanlar kaldırıldı */}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-[0_0_22px_rgba(245,158,11,0.8)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {submitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
            </button>
          </div>
        </form>

        {/* Görsel Yükleme / Önizleme */}
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <div>
            <h2 className="text-lg font-semibold text-zinc-50">
              Ürün Görseli
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Ürün kartlarında gösterilecek görseli URL olarak ekleyebilir veya
              daha sonra da güncelleyebilirsiniz.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
              Ürün Fotoğrafı
            </label>
            <div
              {...getRootProps({
                className: `flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition ${
                  isDragActive
                    ? "border-amber-400 bg-zinc-900/60"
                    : "border-zinc-700 bg-zinc-900/40 hover:border-amber-400 hover:bg-zinc-900/60"
                }`,
              })}
            >
              <input {...getInputProps()} />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-200">
                📷
              </div>
              <p className="text-xs text-zinc-300">
                Fotoğrafı buraya sürükleyin veya{" "}
                <span className="font-semibold text-amber-300">
                  tıklayarak seçin
                </span>
                .
              </p>
              <p className="text-[11px] text-zinc-500">
                Yalnızca görüntü dosyaları, maksimum 1 adet.
              </p>
            </div>
          </div>

          <div className="mt-2 flex-1 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/80 p-4">
            {previewUrl ? (
              <div className="flex h-full flex-col gap-3">
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-zinc-900">
                  <img
                    src={previewUrl}
                    alt="Ürün görsel önizleme"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
                <p className="text-xs text-zinc-400">
                  Görsel, menü kartlarında küçük kırpılmış önizleme olarak
                  kullanılacaktır.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-zinc-500">
                <div className="h-16 w-16 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/60" />
                <p>Henüz bir görsel URL&apos;i eklenmedi.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

