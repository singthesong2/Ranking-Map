import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import localFont from "next/font/local";

const title = "맛집 랭킹 | 내 주변 맛집 찾기";
const description = "내 주변과 원하는 지역의 음식점을 검색하고 비교해 보세요.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "맛집 랭킹",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const wantedSans = localFont({
  src: "../font/WantedSansVariable.woff2",
  variable: "--font-wanted-sans",
  weight: "400 1000",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Malgun Gothic", "sans-serif"],
  preload: false,
});

function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={wantedSans.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default RootLayout;
