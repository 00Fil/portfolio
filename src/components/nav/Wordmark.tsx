import { profile } from "@/content/profile";

/** Il nome nella barra: nome in sans, cognome nel corsivo serif della hero. */
export function Wordmark() {
  const [first, ...rest] = profile.name.split(" ");
  return (
    <span className="whitespace-nowrap text-[17px] font-medium normal-case leading-none tracking-[-0.02em]">
      {first} <span className="t-serif text-[19px] tracking-[-0.005em]">{rest.join(" ")}</span>
    </span>
  );
}
