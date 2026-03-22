"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { API_ORIGIN, API_URL } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  gorsel_url?: string | null;
};

export default function MenuYonetimiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/urunler/`);
      if (!res.ok) {
        throw new Error("Ürün listesi alınırken hata oluştu");
      }
      const data = (await res.json()) as Product[];
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Ürünleri çekerken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function deleteProduct(id: number) {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/urunler/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Ürün silinemedi.");
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Ürün silinirken beklenmeyen bir hata oluştu."
      );
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Menü Yönetimi
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Sisteme eklenmiş tüm ürünleri, görselleriyle birlikte görüntüleyin.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
          {error}
        </div>
      )}


      {/* Ürün Listesi - Görselli Grid */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-[0_0_35px_rgba(0,0,0,0.4)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Menüdeki Ürünler
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Aşağıda, veritabanında kayıtlı olan ürünler görüntülenmektedir.
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
            Toplam ürün:{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {products.length}
            </span>
          </span>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Ürünler yükleniyor...
          </div>
        ) : products.length === 0 ? (
          <div className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Henüz kayıtlı ürün yok. Yeni ürün ekleyerek menünüzü oluşturun.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const rawUrl =
                p.gorsel_url ||
                "https://images.pexels.com/photos/18602050/pexels-photo-18602050/free-photo-of-yemek-masa-icmek-kahve.jpeg?auto=compress&cs=tinysrgb&w=400";
              const imageUrl =
                rawUrl.startsWith("http") ? rawUrl : `${API_ORIGIN}${rawUrl}`;

              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md transition hover:border-indigo-400/50 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="truncate font-medium drop-shadow-sm">
                        {p.name}
                      </span>
                      <span className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white">
                        {p.price.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        <img
                          src={imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="truncate rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-200">
                        {p.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-300/60 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 transition hover:bg-red-100 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

