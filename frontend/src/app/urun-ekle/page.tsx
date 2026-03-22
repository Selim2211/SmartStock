"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { API_URL } from "@/lib/api";

const categories = ["Kahveler", "Tatlılar", "Sandviçler", "Soğuk İçecekler"];

const cardShell =
  "rounded-2xl border border-espresso-border bg-[#f8f3ea] p-6 shadow-sm dark:bg-espresso-surface/90 dark:shadow-[0_0_40px_rgba(0,0,0,0.35)]";

const inputClass =
  "w-full rounded-xl border border-espresso-border bg-white/90 px-3 py-2.5 text-sm text-espresso placeholder-espresso/40 shadow-inner outline-none transition hover:border-espresso-latte/50 focus:border-espresso-latte focus:ring-2 focus:ring-espresso-latte/40 dark:bg-espresso-bg/80 dark:text-espresso-cream dark:placeholder-espresso-muted";

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

      const res = await fetch(`${API_URL}/urunler`, {
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
          <h1 className="text-2xl font-semibold text-espresso dark:text-espresso-cream">
            Yeni Ürün Ekle
          </h1>
          <p className="mt-1 text-sm text-espresso/75 dark:text-espresso-muted">
            Ürünün tüm detaylarını ve isteğe bağlı görselini ekleyerek menünüze
            kaydedin.
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

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        <form className={cardShell} onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
                Ürün Bilgileri
              </h2>
              <p className="mt-1 text-xs text-espresso/70 dark:text-espresso-muted">
                Fiyat ve kategori bilgileri menü ve raporlarda kullanılır.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
                Ürün Adı
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Flat White, Tiramisu, Cold Brew..."
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Kategori seçin</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
                Fiyat (₺)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-espresso-border bg-white/90 px-3 py-2.5 shadow-inner focus-within:border-espresso-latte focus-within:ring-2 focus-within:ring-espresso-latte/40 dark:bg-espresso-bg/80">
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full bg-transparent text-sm text-espresso outline-none dark:text-espresso-cream"
                  placeholder="Örn: 85"
                />
                <span className="text-xs font-medium text-espresso/50 dark:text-espresso-muted">
                  ₺
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-espresso-latte px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-espresso-latte-dark disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-espresso-latte focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f3ea] dark:focus-visible:ring-offset-espresso-surface"
            >
              {submitting ? "Kaydediliyor..." : "Ürünü Kaydet"}
            </button>
          </div>
        </form>

        <section className={`flex flex-col gap-4 ${cardShell}`}>
          <div>
            <h2 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
              Ürün Görseli
            </h2>
            <p className="mt-1 text-xs text-espresso/70 dark:text-espresso-muted">
              Ürün kartlarında gösterilecek görseli yükleyebilir veya daha sonra
              güncelleyebilirsiniz.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-espresso/60 dark:text-espresso-muted">
              Ürün Fotoğrafı
            </label>
            <div
              {...getRootProps({
                className: `flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition ${
                  isDragActive
                    ? "border-espresso-latte bg-espresso-latte/10"
                    : "border-espresso-border bg-espresso-border/10 hover:border-espresso-latte/60 dark:bg-espresso-bg/50"
                }`,
              })}
            >
              <input {...getInputProps()} />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso-border/40 text-espresso-cream">
                📷
              </div>
              <p className="text-xs text-espresso/85 dark:text-espresso-muted">
                Fotoğrafı buraya sürükleyin veya{" "}
                <span className="font-semibold text-espresso-latte">
                  tıklayarak seçin
                </span>
                .
              </p>
              <p className="text-[11px] text-espresso/55 dark:text-espresso-muted">
                Yalnızca görüntü dosyaları, maksimum 1 adet.
              </p>
            </div>
          </div>

          <div className="mt-2 flex-1 rounded-2xl border border-dashed border-espresso-border bg-white/50 p-4 dark:bg-espresso-bg/60">
            {previewUrl ? (
              <div className="flex h-full flex-col gap-3">
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-espresso-bg">
                  <img
                    src={previewUrl}
                    alt="Ürün görsel önizleme"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
                <p className="text-xs text-espresso/70 dark:text-espresso-muted">
                  Görsel, menü kartlarında küçük kırpılmış önizleme olarak
                  kullanılacaktır.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-espresso/55 dark:text-espresso-muted">
                <div className="h-16 w-16 rounded-2xl border border-dashed border-espresso-border bg-espresso-border/15" />
                <p>Henüz bir görsel eklenmedi.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
