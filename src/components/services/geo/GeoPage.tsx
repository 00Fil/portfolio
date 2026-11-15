"use client";

import type { Locale } from "@/i18n/routing";
import type { GeoContent } from "@/content/geo";
import { GeoHero } from "./GeoHero";
import { GeoShift } from "./GeoShift";
import { GeoStage } from "./GeoStage";
import { GeoProcess } from "./GeoProcess";
import { GeoDeliverables } from "./GeoDeliverables";
import { GeoRealityAndTrust } from "./GeoRealityAndTrust";
import { GeoFaqClose, type NextServiceInfo, type OtherServiceInfo } from "./GeoFaqClose";

export function GeoPage({
  locale,
  content,
  servicesLabel,
  next,
  others,
  nextLabel,
  allLabel,
  github,
}: {
  locale: Locale;
  content: GeoContent;
  servicesLabel: string;
  next: NextServiceInfo;
  others: OtherServiceInfo[];
  nextLabel: string;
  allLabel: string;
  github?: string;
}) {
  return (
    <>
      <GeoHero locale={locale} content={content.hero} servicesLabel={servicesLabel} />
      <GeoShift content={content.shift} />
      <GeoStage locale={locale} content={content.stage} />
      <GeoProcess content={content.process} />
      <GeoDeliverables content={content.deliverables} />
      <GeoRealityAndTrust
        reality={content.reality}
        timeline={content.timeline}
        promise={content.promise}
        github={github}
      />
      <GeoFaqClose
        faq={content.faq}
        close={content.close}
        next={next}
        others={others}
        nextLabel={nextLabel}
        allLabel={allLabel}
      />
    </>
  );
}
