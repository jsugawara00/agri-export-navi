import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "農産物輸出ナビ | Toika Export Navigator",
  description:
    "調べる数ヶ月を、確かめる数分に。品目と国を選ぶだけで、農産物輸出の可否と手続きを数分で確認できる無料サイトです（山形県産の主要8品目×10の国・地域に対応）。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <footer className="mt-auto border-t border-line px-6 py-4 text-center text-[11px] leading-relaxed text-dim/80">
          <p>
            本サイトは輸出判断の下調べを速くする道具です。すべての手続き・確認事項の
            網羅を保証するものではなく、最終確認は植物防疫所等の公的機関へお願いします。
          </p>
          <p className="mt-1">
            「この確認も必要では？」という現場の気づきが本サイトを育てます。
            お気づきの点はぜひ教えてください — 2〜3日を目安に反映します。
          </p>
        </footer>
      </body>
    </html>
  );
}
