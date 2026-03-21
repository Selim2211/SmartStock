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
    <aside className="fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-[#3E2723] text-[#F8F5F0] dark:bg-[#0A0A0A]">
      <div className="flex h-16 items-center justify-between gap-2 border-b border-stone-200/20 px-4 bg-[#3E2723]/90 backdrop-blur dark:bg-[#0A0A0A]/90">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3C2F2F] shadow-[0_0_18px_rgba(0,0,0,0.25)]">
            <span className="text-lg font-black tracking-tight text-[#FDFCF9]">
              SS
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-[#F8F5F0]">
              SmartStock
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#D7C2B3]">
              POS &amp; Kafe Yönetimi
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-500/60 bg-black/10 text-[#F8F5F0] shadow-sm hover:bg-black/20"
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
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C07F5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3E2723] dark:focus-visible:ring-offset-[#0A0A0A]",
                isActive
                  ? "bg-[#C07F5A] text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
                  : "text-[#F8F5F0] hover:bg-[#5A3A32]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-[15px]",
                  isActive
                    ? "border-[#C07F5A] bg-[#F8F5F0] text-[#C07F5A]"
                    : "border-stone-600 bg-[#4A2F29] group-hover:border-[#C07F5A]",
                ].join(" ")}
              >
                <Icon
                  className={
                    isActive
                      ? "h-4 w-4 text-[#C07F5A]"
                      : "h-4 w-4 text-[#F8F5F0]"
                  }
                />
              </span>
              <span className="flex-1 text-left">{item.label}</span>

              {!isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-stone-600 group-hover:bg-[#C07F5A]" />
              )}

              {isActive && (
                <span className="ml-1 h-7 w-1 rounded-full bg-[#3C2F2F]/70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-stone-800/60 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between text-[11px] text-[#D7C2B3]">
          <span className="uppercase tracking-[0.18em]">Aktif Şube</span>
          <span className="rounded-full bg-[#5A3A32] px-2 py-0.5 text-[10px] font-medium text-[#F8F5F0] shadow-sm">
            Merkez
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-900">
          <div className="h-full w-2/3 rounded-full bg-[#C07F5A]" />
        </div>
        <p className="text-[11px] text-[#D7C2B3]">
          Bugünkü işlemler stabil. Satış yoğunluğu:{" "}
          <span className="font-semibold text-[#F8F5F0]">%67</span>
        </p>
      </div>
    </aside>
  );
}

