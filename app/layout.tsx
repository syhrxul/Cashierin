import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cashierin - Aplikasi Kasir (POS) Online Terbaik di Indonesia",
  description: "Kelola transaksi, stok barang, dan laporan penjualan toko Anda dengan Cashierin. Aplikasi kasir (POS) modern, cepat, dan aman untuk UMKM, Ritel, hingga Restoran.",
  keywords: [
    "aplikasi kasir",
    "kasir online",
    "software kasir",
    "POS Indonesia",
    "Point of Sale Indonesia",
    "manajemen toko",
    "aplikasi toko",
    "kasir restoran",
    "software akuntansi toko",
    "digitalisasi UMKM",
    "laporan penjualan otomatis"
  ],
  authors: [{ name: "Cashierin Team" }],
  openGraph: {
    title: "Cashierin - Solusi Pintar Manajemen Kasir",
    description: "Digitalisasi bisnis Anda sekarang dengan sistem POS tercepat dan paling efisien. Coba gratis 30 hari!",
    url: "https://cashierin.com",
    siteName: "Cashierin POS",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Cashierin Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cashierin - Transformasi Digital Toko Anda",
    description: "Satu sistem untuk seluruh operasional bisnis Anda. Cepat, Aman, & Modern.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

