import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartStock",
  description: "Restoran & Kafe SaaS Otomasyonu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen overflow-x-hidden bg-espresso text-espresso-cream antialiased`}
      >
        <ThemeProvider>
          {/* Önce içerik: mobilde drawer/backdrop DOM’da sonra geldiği için üstte boyanır (sıkışık şerit bug’ı). */}
          <main className="relative w-full min-w-0 min-h-screen min-h-[100dvh] bg-espresso pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-14 lg:ml-80 lg:pb-8 lg:pt-0">
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
          <Sidebar />
        </ThemeProvider>
      </body>
    </html>
  );
}
