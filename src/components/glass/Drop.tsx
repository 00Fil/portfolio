"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useDrop } from "./useDrop";
import { scrollToY } from "@/lib/scroll";

type Common = {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  /** Vetro sfocato dietro (per gocce che galleggiano sopra il contenuto). */
  floating?: boolean;
  label?: string;
  /** Raggio dell'angolo per lo smusso di luce: per tessere non a pillola. */
  radius?: number;
};

type AsButton = Common & { onClick?: () => void; href?: undefined; external?: undefined; download?: undefined };
type AsLink = Common & { href: string; external?: boolean; download?: boolean; onClick?: () => void };

/** Una goccia di vetro: tasto o link. */
export function Drop(props: AsButton | AsLink) {
  const { children, className = "", accent, floating, label, radius } = props;
  const cls = `drop ${accent ? "drop-accent" : ""} ${floating ? "float-glass" : ""} inline-flex items-center justify-center gap-2 ${className}`;
  const glow = <span className="drop-glow" aria-hidden />;

  if (props.href !== undefined) {
    if (props.href.startsWith("#")) {
      const target = props.href.slice(1);
      const user = props.onClick;
      return (
        <DropAnchor
          href={props.href}
          className={cls}
          label={label}
          radius={radius}
          onClick={(e) => {
            e?.preventDefault();
            user?.();
            const el = document.getElementById(target);
            if (el) scrollToY(Math.min(el.getBoundingClientRect().top + window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
          }}
        >
          {glow}
          {children}
        </DropAnchor>
      );
    }
    if (props.external || props.download || props.href.startsWith("mailto:")) {
      return (
        <DropAnchor
          href={props.href}
          className={cls}
          label={label}
          radius={radius}
          external={props.external}
          download={props.download}
          onClick={props.onClick}
        >
          {glow}
          {children}
        </DropAnchor>
      );
    }
    return (
      <DropLink href={props.href} className={cls} label={label} radius={radius} onClick={props.onClick}>
        {glow}
        {children}
      </DropLink>
    );
  }
  return (
    <DropButton className={cls} label={label} radius={radius} onClick={props.onClick}>
      {glow}
      {children}
    </DropButton>
  );
}

function DropButton({ children, className, label, radius, onClick }: { children: ReactNode; className: string; label?: string; radius?: number; onClick?: () => void }) {
  const { ref } = useDrop<HTMLButtonElement>({ radius });
  return (
    <button ref={ref} type="button" className={className} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function DropAnchor({
  children,
  className,
  label,
  radius,
  href,
  external,
  download,
  onClick,
}: {
  children: ReactNode;
  className: string;
  label?: string;
  radius?: number;
  href: string;
  external?: boolean;
  download?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}) {
  const { ref } = useDrop<HTMLAnchorElement>({ radius });
  return (
    <a
      ref={ref}
      href={href}
      className={className}
      aria-label={label}
      onClick={onClick}
      download={download || undefined}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function DropLink({ children, className, label, radius, href, onClick }: { children: ReactNode; className: string; label?: string; radius?: number; href: string; onClick?: () => void }) {
  const { ref } = useDrop<HTMLAnchorElement>({ radius });
  return (
    <Link ref={ref} href={href} className={className} aria-label={label} onClick={onClick}>
      {children}
    </Link>
  );
}
