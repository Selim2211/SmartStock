"use client";

import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { API_ORIGIN, API_URL } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  gorsel_url?: string | null;
};

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

const DEFAULT_IMAGE =
  "https://images.pexels.com/photos/18602050/pexels-photo-18602050/free-photo-of-yemek-masa-icmek-kahve.jpeg?auto=compress&cs=tinysrgb&w=400";

function getImageUrl(gorselUrl: string | null | undefined): string {
  if (!gorselUrl) return DEFAULT_IMAGE;
  return gorselUrl.startsWith("http") ? gorselUrl : `${API_ORIGIN}${gorselUrl}`;
}

export default function HizliSatisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/urunler/`);
      if (!res.ok) throw new Error("Ürünler yüklenemedi.");
      const data = (await res.json()) as Product[];
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = [
    "Tümü",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts =
    selectedCategory === "Tümü"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (!item) return prev;
      const next = item.quantity + delta;
      if (next <= 0)
        return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: next } : i
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleNakit = useCallback(() => {
    if (cart.length === 0) return;
    // TODO: Ödeme işlemi
    alert(`Nakit ödeme: ${total.toFixed(2)} ₺\n(Entegrasyon sonra eklenecek)`);
    setCart([]);
  }, [cart.length, total]);

  const handleKrediKarti = useCallback(() => {
    if (cart.length === 0) return;
    // TODO: Ödeme işlemi
    alert(`Kredi kartı ödeme: ${total.toFixed(2)} ₺\n(Entegrasyon sonra eklenecek)`);
    setCart([]);
  }, [cart.length, total]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[520px] w-full flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        {/* Sol: Menü / Ürünler (%70) */}
        <div className="flex flex-col overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Menü / Ürünler
            </h1>
          </div>

          {/* Kategori butonları */}
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-500 dark:bg-indigo-600"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ürün grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                Ürünler yükleniyor...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                Bu kategoride ürün yok.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 text-left shadow-sm transition hover:border-indigo-400/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-800/80 dark:hover:border-indigo-500/50"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                      <img
                        src={getImageUrl(p.gorsel_url)}
                        alt={p.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-1 p-2.5">
                      <span className="line-clamp-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {p.name}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {p.price.toFixed(2)} ₺
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Adisyon / Sepet (%30) */}
        <div className="flex flex-col border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950 lg:border-t-0 lg:border-l">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Sepet
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
                <p>Sepet boş</p>
                <p className="text-xs">Ürün eklemek için soldan karta tıklayın.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.price.toFixed(2)} ₺ × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Azalt"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        aria-label="Artır"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-300 text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Toplam
              </span>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {total.toFixed(2)} ₺
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleNakit}
                disabled={cart.length === 0}
                className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              >
                NAKİT
              </button>
              <button
                type="button"
                onClick={handleKrediKarti}
                disabled={cart.length === 0}
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
              >
                KREDİ KARTI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
