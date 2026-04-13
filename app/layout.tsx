import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Jika Anda sudah memisahkan Navbar ke komponen terpisah, uncomment baris di bawah ini:
// import Navbar from "@/components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkinPOS",
  description: "Sistem Operasional Terpadu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        
        {/* Letakkan Navbar/Header Anda HANYA di dalam tag body ini */}
        {/* <Navbar /> */}

        {/* children ini adalah isi dari page.tsx (halaman login, kasir, dll) */}
        {children}
        
      </body>
    </html>
  );
}