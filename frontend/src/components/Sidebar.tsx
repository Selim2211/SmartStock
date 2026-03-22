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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark" || theme === "dark";
  const isLight = mounted && !isDark;

  const shell = isLight
    ? "border-espresso-border bg-[#EDE4D3] text-espresso"
    : "border-espresso-border bg-espresso-sidebar text-espresso-cream";

  const headerBar = isLight
    ? "border-espresso-border bg-[#E8DCC8]/95"
    : "border-espresso-border bg-espresso-sidebar/95";

  const mutedText = isLight ? "text-espresso/70" : "text-espresso-muted";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 border-r ${shell}`}
    >
      <div
        className={`flex h-16 items-center justify-between gap-2 border-b px-4 backdrop-blur ${headerBar}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso-latte shadow-lg shadow-black/20">
            <span className="text-lg font-black tracking-tight text-white">
              SS
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className={`text-sm font-semibold tracking-wide ${isLight ? "text-espresso" : "text-espresso-cream"}`}>
              SmartStock
            </span>
            <span className={`text-[11px] font-medium uppercase tracking-[0.22em] ${mutedText}`}>
              POS &amp; Kafe Yönetimi
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm shadow-sm transition ${
            isLight
              ? "border-espresso-border bg-white/80 text-espresso hover:bg-white"
              : "border-espresso-border bg-espresso-surface text-espresso-cream hover:bg-espresso-surface/80"
          }`}
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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-espresso-latte focus-visible:ring-offset-2",
                isLight ? "focus-visible:ring-offset-[#EDE4D3]" : "focus-visible:ring-offset-espresso-sidebar",
                isActive
                  ? "bg-espresso-latte text-white shadow-lg shadow-black/25 hover:bg-espresso-latte-dark"
                  : isLight
                  ? "text-espresso/90 hover:bg-black/5"
                  : "text-espresso-cream hover:bg-espresso-surface/80",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-[15px]",
                  isActive
                    ? "border-white/25 bg-white/10 text-white"
                    : isLight
                    ? "border-espresso-border/50 bg-white/50 group-hover:border-espresso-latte/40"
                    : "border-espresso-border bg-espresso-surface/60 group-hover:border-espresso-latte/50",
                ].join(" ")}
              >
                <Icon
                  className={
                    isActive
                      ? "h-4 w-4 text-white"
                      : isLight
                      ? "h-4 w-4 text-espresso/80"
                      : "h-4 w-4 text-espresso-cream"
                  }
                />
              </span>
              <span className="flex-1 text-left">{item.label}</span>

              {!isActive && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLight ? "bg-espresso/25 group-hover:bg-espresso-latte" : "bg-espresso-border group-hover:bg-espresso-latte"
                  }`}
                />
              )}

              {isActive && (
                <span className="ml-1 h-7 w-1 rounded-full bg-white/35" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={`mt-auto flex flex-col gap-2 border-t px-4 pb-4 pt-3 ${
          isLight ? "border-espresso-border" : "border-espresso-border"
        }`}
      >
        <div className={`flex items-center justify-between text-[11px] ${mutedText}`}>
          <span className="uppercase tracking-[0.18em]">Aktif Şube</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ${
              isLight
                ? "bg-espresso-latte/15 text-espresso ring-1 ring-espresso-border"
                : "bg-espresso-surface text-espresso-cream ring-1 ring-espresso-border"
            }`}
          >
            Merkez
          </span>
        </div>
        <div
          className={`h-1.5 overflow-hidden rounded-full ${
            isLight ? "bg-espresso-border/40" : "bg-espresso-border"
          }`}
        >
          <div className="h-full w-2/3 rounded-full bg-espresso-latte" />
        </div>
        <p className={`text-[11px] ${mutedText}`}>
          Bugünkü işlemler stabil. Satış yoğunluğu:{" "}
          <span className={`font-semibold ${isLight ? "text-espresso" : "text-espresso-cream"}`}>
            %67
          </span>
        </p>
      </div>
    </aside>
  );
}
