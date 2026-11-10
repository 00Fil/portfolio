import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Stack } from "@/components/sections/Stack";
import { Path } from "@/components/sections/Path";
import { Assistant } from "@/components/sections/Assistant";
import { Footer } from "@/components/sections/Footer";
import { SiteNav } from "@/components/nav/SiteNav";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main id="main">
        <Hero />
        <Services />
        <Work />
        <Path />
        <Stack />
        <Assistant />
      </main>
      <Footer />
      <SiteNav />
    </>
  );
}
