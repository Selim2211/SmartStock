"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bean, X } from "lucide-react";
import { API_ORIGIN, apiUrl, ensureHttpsUnlessLocal } from "@/lib/api";

/** Kişi içermeyen kahve / ürün placeholder (erkek fotoğrafı kullanılmaz) */
const PRODUCT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80&auto=format&fit=crop";

type OrderItemLine = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type TableResponse = {
  id: number;
  name: string;
  is_occupied: boolean;
  items: OrderItemLine[];
  total_amount: number;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  gorsel_url?: string | null;
};

function productImageUrl(p: Product): string {
  const raw = p.gorsel_url || PRODUCT_PLACEHOLDER;
  const abs = raw.startsWith("http") ? raw : `${API_ORIGIN}${raw}`;
  return ensureHttpsUnlessLocal(abs);
}

export default function MasalarPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [modalTable, setModalTable] = useState<TableResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      setProductsError(null);
      const [tRes, pRes] = await Promise.all([
        fetch(apiUrl("/tables")),
        fetch(apiUrl("/urunler")),
      ]);
      if (!tRes.ok) throw new Error("Masalar yüklenemedi.");
      if (!pRes.ok) {
        setProducts([]);
        setProductsError("Ürünleri çekerken bir sorun oluştu.");
      } else {
        setProducts((await pRes.json()) as Product[]);
      }
      setTables((await tRes.json()) as TableResponse[]);
    } catch (e) {
      console.error(e);
      setError("Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refreshTables = useCallback(async () => {
    const tRes = await fetch(apiUrl("/tables"));
    if (!tRes.ok) return;
    const data = (await tRes.json()) as TableResponse[];
    setTables(data);
    return data;
  }, []);

  const openModal = (t: TableResponse) => {
    setModalTable(t);
  };

  const closeModal = () => setModalTable(null);

  const syncModalFromTables = useCallback(
    (list: TableResponse[], id: number) => {
      const t = list.find((x) => x.id === id);
      if (t) setModalTable(t);
    },
    []
  );

  const addProduct = async (productId: number) => {
    if (!modalTable || actionLoading) return;
    try {
      setActionLoading(true);
      const res = await fetch(
        apiUrl(`/tables/${modalTable.id}/add_item`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, quantity: 1 }),
        }
      );
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.detail || "Ürün eklenemedi.");
      }
      const list = await refreshTables();
      if (list) syncModalFromTables(list, modalTable.id);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setActionLoading(false);
    }
  };

  const checkout = async (mode: "nakit" | "kart") => {
    if (!modalTable || actionLoading) return;
    try {
      setActionLoading(true);
      const res = await fetch(apiUrl(`/tables/${modalTable.id}/checkout`), {
        method: "POST",
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.detail || "Ödeme tamamlanamadı.");
      }
      await refreshTables();
      closeModal();
      void mode;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-[#F5F1E9] pb-2 dark:bg-espresso sm:min-h-[calc(100vh-6rem)]">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#2D241E] dark:text-espresso-cream sm:text-2xl">
          Adisyon &amp; Masa Planı
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-[#5c4a42] dark:text-espresso-muted">
          Masaya tıklayarak adisyon açın; ürün ekleyin ve ödeme alın.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <button
            type="button"
            className="ml-2 font-medium underline"
            onClick={() => setError(null)}
          >
            Kapat
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-[#6b5d54] dark:text-espresso-muted">Yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {tables.map((t) => {
            const dolu = t.is_occupied && t.total_amount > 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => openModal(t)}
                className={`relative flex min-h-[128px] touch-manipulation flex-col items-center justify-center rounded-2xl border p-5 text-center shadow-md transition-all active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:shadow-lg ${
                  dolu
                    ? "border-[#8B4513]/30 bg-white text-[#2D241E] ring-2 ring-[#8B4513]/20"
                    : "border-white/80 bg-white text-[#2D241E] hover:border-[#8B4513]/40 dark:border-espresso-border dark:bg-espresso-surface dark:text-espresso-cream"
                }`}
              >
                <span className="text-lg font-bold">{t.name}</span>
                {dolu ? (
                  <>
                    <span className="mt-1 text-xs font-medium uppercase tracking-wide text-[#8B4513]">
                      Dolu
                    </span>
                    <span className="mt-1 text-xl font-bold tabular-nums text-[#2D241E] dark:text-espresso-cream">
                      {t.total_amount.toFixed(2)} ₺
                    </span>
                  </>
                ) : (
                  <span className="mt-2 text-sm text-[#6b5d54] dark:text-espresso-muted">
                    Boş
                  </span>
                )}
                <Bean
                  className={`mt-3 h-5 w-5 ${
                    dolu ? "text-[#8B4513]" : "text-[#8D6E63]/80"
                  }`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Modal — koyu kahve tema */}
      {modalTable && (
        <div
          className="fixed inset-0 z-[130] flex items-stretch justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-5xl flex-col overflow-hidden rounded-none border-0 border-[#3d3229] bg-[#2D241E] shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[20px] sm:border"
          >
            {/* Ürün hatası — tasarımdaki kırmızı şerit */}
            {productsError && (
              <div className="flex items-center gap-2 border-b border-red-900/50 bg-[#5c1f1f] px-4 py-2.5 text-sm text-red-100">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-200" />
                <span>{productsError}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-[#3d3229] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5 sm:py-4 sm:pt-4">
              <div className="min-w-0 pr-2">
                <h2 className="text-lg font-bold text-[#F5F1E9] sm:text-xl">
                  {modalTable.name}
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-[#D6C7A1] sm:text-xs">
                  Menüden ürün ekleyin; adisyon altta güncellenir.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="touch-target shrink-0 rounded-full p-2 text-[#D6C7A1] transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-6 w-6 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Üst / sol: menü (mobilde üstte) */}
              <div className="max-h-[45vh] min-h-0 overflow-y-auto border-b border-[#3d3229] p-4 sm:max-h-[58vh] lg:max-h-[72vh] lg:border-b-0 lg:border-r">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D6C7A1]">
                  Menü
                </h3>
                <div className="flex flex-col gap-3">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#e8e0d4]/20 bg-[#F5F1E9] p-3 shadow-sm sm:flex-row sm:items-center sm:gap-3"
                    >
                      <div className="flex items-start gap-3 sm:contents">
                        <img
                          src={productImageUrl(p)}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-[72px] sm:w-[72px]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#2D241E]">{p.name}</p>
                          <span className="mt-1 inline-block rounded-full border border-[#8B4513]/35 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-[#5c4a42]">
                            {p.category}
                          </span>
                          <p className="mt-1.5 text-base font-bold tabular-nums text-[#2D241E]">
                            {Number(p.price).toFixed(2)} TL{" "}
                            <span className="text-sm font-semibold">₺</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={actionLoading || !!productsError}
                        onClick={() => addProduct(p.id)}
                        className="w-full shrink-0 touch-manipulation rounded-xl bg-[#8B4513] py-3 text-sm font-semibold text-white shadow-md transition active:bg-[#6d360f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4 sm:py-2.5 sm:hover:bg-[#6d360f]"
                      >
                        Ekle
                      </button>
                    </div>
                  ))}
                  {products.length === 0 && !productsError && (
                    <p className="text-sm text-[#D6C7A1]">
                      Henüz ürün yok veya liste boş.
                    </p>
                  )}
                </div>
              </div>

              {/* Alt / sağ: adisyon */}
              <div className="flex min-h-0 flex-1 flex-col bg-[#231a14] sm:max-h-[52vh] lg:max-h-[72vh]">
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D6C7A1]">
                    Adisyon
                  </h3>
                  {modalTable.items.length === 0 ? (
                    <p className="text-sm text-[#a89880]">
                      Henüz ürün yok.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {modalTable.items.map((line) => (
                        <li
                          key={line.id}
                          className="flex justify-between gap-2 border-b border-[#3d3229] pb-2 text-sm"
                        >
                          <span className="text-[#F5F1E9]">
                            {line.product_name}{" "}
                            <span className="text-[#a89880]">
                              ×{line.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums text-[#F5E8C7]">
                            {line.line_total.toFixed(2)} ₺
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-[#3d3229] bg-[#1f1812] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <div className="mb-4 flex items-end justify-between gap-2">
                    <span className="text-sm font-medium text-[#D6C7A1]">
                      Genel Toplam
                    </span>
                    <span className="text-2xl font-black tabular-nums tracking-tight text-[#F5E8C7] sm:text-3xl">
                      {modalTable.total_amount.toFixed(2)} ₺
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        actionLoading || modalTable.items.length === 0
                      }
                      onClick={() => checkout("nakit")}
                      className="touch-manipulation rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition active:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:hover:bg-emerald-600"
                    >
                      Nakit Ödeme
                    </button>
                    <button
                      type="button"
                      disabled={
                        actionLoading || modalTable.items.length === 0
                      }
                      onClick={() => checkout("kart")}
                      className="touch-manipulation rounded-xl bg-indigo-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3 sm:hover:bg-indigo-600"
                    >
                      Kredi Kartı
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
