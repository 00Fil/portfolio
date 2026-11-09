import { profile } from "@/content/profile";

/** Il nome nella barra: nome pieno, cognome più leggero. */
export function Wordmark() {
  const [first, ...rest] = profile.name.split(" ");
  return (
    <span className="whitespace-nowrap text-[17px] font-medium normal-case leading-none tracking-[-0.02em]">
      {first} <span className="font-normal text-ink-2">{rest.join(" ")}</span>
    </span>
  );
}
