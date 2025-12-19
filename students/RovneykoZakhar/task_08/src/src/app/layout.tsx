import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Каталог образовательных курсов",
  description: "Курсы по программированию, языкам, дизайну и многое другое",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
    <body className={inter.className}>
    <Providers>
      <nav className="bg-indigo-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex gap-8">
          <Link href="/">Главная</Link>
          <Link href="/courses">Все курсы</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </Providers>
    </body>
    </html>
  );
}