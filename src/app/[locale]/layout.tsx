import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { routing } from "@/i18n/routing";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { TopBar } from "@/components/nav/TopBar";
import { profile } from "@/content/profile";
import "../globals.css";

const serif = localFont({
  src: [
    { path: "../../fonts/instrument-serif-latin-400-italic.woff2", style: "italic", weight: "400" },
    { path: "../../fonts/instrument-serif-latin-400-normal.woff2", style: "normal", weight: "400" },
  ],
  variable: "--font-serif",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark", viewportFit: "cover" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(profile.site),
    title: { default: t("title", { name: profile.name }), template: `%s — ${profile.name}` },
    description: t("description"),
    alternates: { canonical: `/${locale}`, languages: { it: "/it", en: "/en", "x-default": "/it" } },
    openGraph: { title: t("title", { name: profile.name }), description: t("description"), locale, type: "website" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable} ${serif.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">
            {t("skip")}
          </a>
          <SmoothScroll />
          <TopBar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
