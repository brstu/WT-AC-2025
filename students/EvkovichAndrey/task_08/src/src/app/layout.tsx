import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider"; // ← сюда вынесем провайдер

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicBrainz Explorer",
  description: "Поиск артистов в открытой музыкальной базе",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
    <body className={inter.className}>
    <QueryProvider>{children}</QueryProvider>
    </body>
    </html>
  );
}