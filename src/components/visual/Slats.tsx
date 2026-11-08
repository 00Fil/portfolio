"use client";

import { useEffect, useState } from "react";

/** MicroSlats di Relay (preset "swell") come copertina della case study. */
export function Slats() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);
  return (
    <div aria-hidden className="relative mb-12 aspect-[16/7] w-full overflow-hidden rounded-[28px] bg-surface sm:mb-16">
      {on && <iframe src="/visual/slats.html?bg=000000" title="" tabIndex={-1} className="absolute inset-0 h-full w-full border-0" />}
    </div>
  );
}
