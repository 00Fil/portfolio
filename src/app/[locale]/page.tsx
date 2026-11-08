import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Approach } from "@/components/sections/Approach";
import { Stack } from "@/components/sections/Stack";
import { Path } from "@/components/sections/Path";
import { Questions } from "@/components/sections/Questions";
import { Footer } from "@/components/sections/Footer";
import { SiteNav } from "@/components/nav/SiteNav";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main id="main">
        <Hero />
        <Work />
        <Approach />
        <Stack />
        <Path />
        <Questions />
      </main>
      <Footer />
      <SiteNav />
    </>
  );
}
