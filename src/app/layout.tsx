import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Düzce Üniversitesi ANKA-SİT | Savunma Sanayii ve İleri Teknolojiler Topluluğu",
  description: "ALACA-İHA ve AGV otonom sistem takımları, teknik dosyalar, etkinlik kayıtları ve yönetim platformu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
