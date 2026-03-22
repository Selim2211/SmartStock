"use client";

import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { API_ORIGIN, API_URL, ensureHttpsUnlessLocal } from "@/lib/api";

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
  const abs = gorselUrl.startsWith("http")
    ? gorselUrl
    : `${API_ORIGIN}${gorselUrl}`;
  return ensureHttpsUnlessLocal(abs);
}

export default function HizliSatisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/urunler`);
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
    alert(`Nakit ödeme: ${total.toFixed(2)} ₺\n(Entegrasyon sonra eklenecek)`);
    setCart([]);
  }, [cart.length, total]);

  const handleKrediKarti = useCallback(() => {
    if (cart.length === 0) return;
    alert(`Kredi kartı ödeme: ${total.toFixed(2)} ₺\n(Entegrasyon sonra eklenecek)`);
    setCart([]);
  }, [cart.length, total]);

  const panel =
    "border-espresso-border bg-[#f8f3ea] dark:bg-espresso-surface";

  return (
    <div
      className={`flex h-[calc(100vh-4rem)] min-h-[520px] w-full flex-col gap-0 overflow-hidden rounded-2xl border border-espresso-border shadow-xl ${panel}`}
    >
      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="flex flex-col overflow-hidden border-r border-espresso-border">
          <div className="border-b border-espresso-border px-4 py-3">
            <h1 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
              Menü / Ürünler
            </h1>
          </div>

          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-espresso-border px-4 py-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-espresso-latte focus:ring-offset-2 focus:ring-offset-[#f8f3ea] dark:focus:ring-offset-espresso-surface ${
                  selectedCategory === cat
                    ? "bg-espresso-latte text-white shadow-md hover:bg-espresso-latte-dark"
                    : "border border-espresso-border/60 bg-white/90 text-espresso hover:bg-white dark:border-espresso-border dark:bg-espresso-bg/80 dark:text-espresso-cream dark:hover:bg-espresso-bg"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-espresso/65 dark:text-espresso-muted">
                Ürünler yükleniyor...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-espresso/65 dark:text-espresso-muted">
                Bu kategoride ürün yok.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-espresso-border bg-white/95 text-left shadow-sm transition hover:border-espresso-latte/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-espresso-latte focus:ring-offset-2 focus:ring-offset-[#f8f3ea] dark:bg-espresso-bg/90 dark:focus:ring-offset-espresso-surface"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-espresso-border/25 dark:bg-espresso-bg">
                      <img
                        src={getImageUrl(p.gorsel_url)}
                        alt={p.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-1 p-2.5">
                      <span className="line-clamp-2 text-sm font-medium text-espresso dark:text-espresso-cream">
                        {p.name}
                      </span>
                      <span className="text-sm font-semibold text-espresso-latte dark:text-espresso-cream">
                        {p.price.toFixed(2)} ₺
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex flex-col border-t border-espresso-border lg:border-t-0 lg:border-l ${panel}`}
        >
          <div className="border-b border-espresso-border px-4 py-3">
            <h2 className="text-lg font-semibold text-espresso dark:text-espresso-cream">
              Sepet
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-espresso/65 dark:text-espresso-muted">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-espresso-border" />
                <p>Sepet boş</p>
                <p className="text-xs">Ürün eklemek için soldan karta tıklayın.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center gap-3 rounded-xl border border-espresso-border bg-white/95 p-2.5 dark:bg-espresso-bg/90"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-espresso dark:text-espresso-cream">
                        {item.name}
                      </p>
                      <p className="text-xs text-espresso/65 dark:text-espresso-muted">
                        {item.price.toFixed(2)} ₺ × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-espresso-border text-espresso transition hover:bg-espresso-border/20 dark:text-espresso-cream"
                        aria-label="Azalt"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-espresso dark:text-espresso-cream">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-espresso-border text-espresso transition hover:bg-espresso-border/20 dark:text-espresso-cream"
                        aria-label="Artır"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/50 text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
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

          <div className="shrink-0 border-t border-espresso-border p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-espresso/75 dark:text-espresso-muted">
                Toplam
              </span>
              <span className="text-xl font-bold tracking-tight text-espresso dark:text-espresso-cream">
                {total.toFixed(2)} ₺
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleNakit}
                disabled={cart.length === 0}
                className="flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#f8f3ea] dark:focus:ring-offset-espresso-surface"
              >
                NAKİT
              </button>
              <button
                type="button"
                onClick={handleKrediKarti}
                disabled={cart.length === 0}
                className="flex items-center justify-center rounded-xl bg-espresso-latte px-4 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-espresso-latte-dark disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-espresso-latte focus:ring-offset-2 focus:ring-offset-[#f8f3ea] dark:focus:ring-offset-espresso-surface"
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
