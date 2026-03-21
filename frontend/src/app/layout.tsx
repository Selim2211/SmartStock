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
        className={`${inter.className} min-h-screen bg-[#F8F5F0] text-[#3E2723] antialiased dark:bg-[#121212] dark:text-[#F8F5F0]`}
      >
        <ThemeProvider>
          <Sidebar />
          <main className="ml-72 min-h-screen bg-[#F8F5F0] dark:bg-[#121212]">
            <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

