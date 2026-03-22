"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Radio,
  BookOpenText,
  Layers3,
  Table2,
  QrCode,
  FileBarChart2,
  PlusCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

type MenuKey =
  | "panel"
  | "hizli-satis"
  | "adisyon-masa"
  | "canli-siparisler"
  | "urun-ekle"
  | "menu-yonetimi"
  | "kategoriler"
  | "masa-yonetimi"
  | "qr-kod"
  | "gun-sonu";

const menuItems: {
  key: MenuKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}[] = [
  { key: "panel", label: "Panel", icon: LayoutDashboard, href: "/" },
  {
    key: "hizli-satis",
    label: "Hızlı Satış (Self-Servis)",
    icon: ShoppingBag,
    href: "/hizli-satis",
  },
  {
    key: "adisyon-masa",
    label: "Adisyon / Masa Planı",
    icon: UtensilsCrossed,
    href: "/adisyon-masa",
  },
  {
    key: "canli-siparisler",
    label: "Canlı Siparişler",
    icon: Radio,
    href: "/canli-siparisler",
  },
  {
    key: "urun-ekle",
    label: "Yeni Ürün Ekle",
    icon: PlusCircle,
    href: "/urun-ekle",
  },
  {
    key: "menu-yonetimi",
    label: "Menü Yönetimi",
    icon: BookOpenText,
    href: "/menu-yonetimi",
  },
  {
    key: "kategoriler",
    label: "Kategoriler",
    icon: Layers3,
    href: "/kategoriler",
  },
  {
    key: "masa-yonetimi",
    label: "Masa Yönetimi",
    icon: Table2,
    href: "/masa-yonetimi",
  },
  {
    key: "qr-kod",
    label: "QR Kod İndir / Yazdır",
    icon: QrCode,
    href: "/qr-kod",
  },
  {
    key: "gun-sonu",
    label: "Gün Sonu Raporları",
    icon: FileBarChart2,
    href: "/gun-sonu-raporlari",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/25 dark:bg-indigo-500">
            <span className="text-lg font-black tracking-tight text-white">
              SS
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-50">
              SmartStock
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              POS &amp; Kafe Yönetimi
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-700 shadow-sm hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          suppressHydrationWarning
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <span className="inline-block h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 dark:bg-indigo-600"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-[15px]",
                  isActive
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-zinc-200 bg-zinc-100 group-hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-800 dark:group-hover:border-indigo-500/50",
                ].join(" ")}
              >
                <Icon
                  className={
                    isActive
                      ? "h-4 w-4 text-white"
                      : "h-4 w-4 text-zinc-600 dark:text-zinc-300"
                  }
                />
              </span>
              <span className="flex-1 text-left">{item.label}</span>

              {!isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 group-hover:bg-indigo-400 dark:bg-zinc-600" />
              )}

              {isActive && (
                <span className="ml-1 h-7 w-1 rounded-full bg-white/40" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-800">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="uppercase tracking-[0.18em]">Aktif Şube</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-800 shadow-sm dark:bg-indigo-950 dark:text-indigo-200">
            Merkez
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full w-2/3 rounded-full bg-indigo-500" />
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Bugünkü işlemler stabil. Satış yoğunluğu:{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">%67</span>
        </p>
      </div>
    </aside>
  );
}

