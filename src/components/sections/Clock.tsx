"use client";

import { useEffect, useState } from "react";

/** Ora locale di Brescia, aggiornata ogni 20 secondi. */
export function Clock({ locale }: { locale: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 20000);
    return () => window.clearInterval(id);
  }, []);
  const fmt = (o: Intl.DateTimeFormatOptions) => (now ? new Intl.DateTimeFormat(locale, { timeZone: "Europe/Rome", ...o }).format(now) : "--:--");
  const offset = now
    ? new Intl.DateTimeFormat("en", { timeZone: "Europe/Rome", timeZoneName: "shortOffset" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value ?? ""
    : "";
  return (
    <span className="t-fig">
      {fmt({ hour: "2-digit", minute: "2-digit", hour12: false })}
      <span className="ml-3 text-ink-3">{offset}</span>
    </span>
  );
}
