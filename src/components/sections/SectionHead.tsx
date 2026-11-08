export function SectionHead({ index, title, lead }: { index: string; title: string; lead?: string }) {
  return (
    <header className="mb-10 grid gap-3 sm:mb-14 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-x-12">
      <div>
        <p className="t-label t-fig mb-3 text-ink-3" data-reveal>
          {index}
        </p>
        <h2 className="t-title1 text-ink" data-reveal data-split>
          {title}
        </h2>
      </div>
      {lead && (
        <p className="max-w-[44ch] text-ink-2 sm:text-right" data-reveal>
          {lead}
        </p>
      )}
    </header>
  );
}
