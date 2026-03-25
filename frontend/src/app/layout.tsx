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
      <body className={`${inter.className} overflow-x-hidden antialiased`}>
        <ThemeProvider>
          {/* Root wrapper (kritik): overflow-x kapalı + main içeriği scroll etsin */}
          <div className="flex h-screen w-full overflow-hidden bg-[#FAFAF9] dark:bg-espresso text-espresso-cream">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden pt-14 lg:pt-0">
              <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
