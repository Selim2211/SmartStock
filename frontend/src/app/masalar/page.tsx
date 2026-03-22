"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_ORIGIN, API_URL } from "@/lib/api";

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
  const raw =
    p.gorsel_url ||
    "https://images.pexels.com/photos/18602050/pexels-photo-18602050/free-photo-of-yemek-masa-icmek-kahve.jpeg?auto=compress&cs=tinysrgb&w=200";
  return raw.startsWith("http") ? raw : `${API_ORIGIN}${raw}`;
}

export default function MasalarPage() {
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalTable, setModalTable] = useState<TableResponse | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [tRes, pRes] = await Promise.all([
        fetch(`${API_URL}/tables`),
        fetch(`${API_URL}/urunler/`),
      ]);
      if (!tRes.ok) throw new Error("Masalar yüklenemedi.");
      if (!pRes.ok) throw new Error("Ürünler yüklenemedi.");
      setTables((await tRes.json()) as TableResponse[]);
      setProducts((await pRes.json()) as Product[]);
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
    const tRes = await fetch(`${API_URL}/tables`);
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
        `${API_URL}/tables/${modalTable.id}/add_item`,
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
      const res = await fetch(
        `${API_URL}/tables/${modalTable.id}/checkout`,
        { method: "POST" }
      );
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
    <div className="min-h-[calc(100vh-6rem)] bg-[#FAFAF9] dark:bg-espresso">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-espresso-cream">
          Adisyon &amp; Masa Planı
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-espresso-muted">
          Masaya tıklayarak adisyon açın; ürün ekleyin ve ödeme alın.
        </p>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300/50 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setError(null)}
          >
            Kapat
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-stone-500 dark:text-espresso-muted">Yükleniyor...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tables.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openModal(t)}
              className={`relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 p-4 text-center transition-all ${
                t.is_occupied && t.total_amount > 0
                  ? "scale-105 border-transparent bg-[#3E2723] text-[#F5E8C7] shadow-lg shadow-stone-900/20 hover:bg-[#4E342E]"
                  : "border-stone-200 bg-white text-stone-800 hover:border-[#8D6E63] dark:border-espresso-border dark:bg-espresso-surface dark:text-espresso-cream dark:hover:border-espresso-latte"
              }`}
            >
              <span className="text-lg font-semibold">{t.name}</span>
              {t.is_occupied && t.total_amount > 0 ? (
                <span className="mt-2 text-2xl font-bold tabular-nums">
                  {t.total_amount.toFixed(2)} ₺
                </span>
              ) : (
                <span className="mt-1 text-xs text-stone-500 dark:text-espresso-muted">
                  Boş
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-espresso-border dark:bg-espresso-surface">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-espresso-border">
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-espresso-cream">
                  {modalTable.name}
                </h2>
                <p className="text-xs text-stone-500 dark:text-espresso-muted">
                  Menüden ürün seçin — adisyon sağda güncellenir.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 dark:text-espresso-muted dark:hover:bg-espresso-bg"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Sol: menü */}
              <div className="max-h-[60vh] overflow-y-auto border-b border-stone-200 p-4 lg:max-h-[70vh] lg:border-b-0 lg:border-r dark:border-espresso-border">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600 dark:text-espresso-muted">
                  Menü
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={actionLoading}
                      onClick={() => addProduct(p.id)}
                      className="flex items-center gap-3 rounded-xl border border-stone-200 bg-[#FAFAF9] p-2 text-left transition hover:border-[#8D6E63] disabled:opacity-50 dark:border-espresso-border dark:bg-espresso-bg dark:hover:border-espresso-latte"
                    >
                      <img
                        src={productImageUrl(p)}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900 dark:text-espresso-cream">
                          {p.name}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-espresso-muted">
                          {p.category}
                        </p>
                        <p className="text-sm font-semibold text-[#8D6E63] dark:text-espresso-cream">
                          {Number(p.price).toFixed(2)} ₺
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sağ: adisyon */}
              <div className="flex max-h-[50vh] flex-col border-stone-200 bg-stone-50/80 dark:border-espresso-border dark:bg-espresso-bg/50 lg:max-h-[70vh]">
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600 dark:text-espresso-muted">
                    Adisyon
                  </h3>
                  {modalTable.items.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-espresso-muted">
                      Henüz ürün yok.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {modalTable.items.map((line) => (
                        <li
                          key={line.id}
                          className="flex justify-between gap-2 border-b border-stone-200/80 pb-2 text-sm dark:border-espresso-border"
                        >
                          <span className="text-stone-800 dark:text-espresso-cream">
                            {line.product_name}{" "}
                            <span className="text-stone-500 dark:text-espresso-muted">
                              ×{line.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums text-stone-900 dark:text-espresso-cream">
                            {line.line_total.toFixed(2)} ₺
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-stone-200 bg-white p-4 dark:border-espresso-border dark:bg-espresso-surface">
                  <div className="mb-4 flex items-end justify-between gap-2">
                    <span className="text-sm font-medium text-stone-600 dark:text-espresso-muted">
                      Genel Toplam
                    </span>
                    <span className="text-3xl font-black tabular-nums tracking-tight text-stone-900 dark:text-espresso-cream">
                      {modalTable.total_amount.toFixed(2)} ₺
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={
                        actionLoading || modalTable.items.length === 0
                      }
                      onClick={() => checkout("nakit")}
                      className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Nakit Ödeme
                    </button>
                    <button
                      type="button"
                      disabled={
                        actionLoading || modalTable.items.length === 0
                      }
                      onClick={() => checkout("kart")}
                      className="rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
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
