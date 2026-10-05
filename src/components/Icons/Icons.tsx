// Small line icons for the detail page's stat cards. They inherit `currentColor`.
import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function GenderIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="14" r="5" />
      <path d="M13.5 10.5 20 4M15 4h5v5M10 19v3M8 21h4" />
    </Svg>
  );
}

export function DnaIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M17 21c0-1.5-.6-2.7-1.5-3.6" />
      <path d="M9 6h6M8.5 18h7M10 9.5h4" />
    </Svg>
  );
}

export function PlanetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="6" />
      <path d="M4.5 15.5C1.5 18 1.6 20 4 20c2.6 0 7.5-2.5 11.5-6S21.8 7 20.5 5.5c-.8-.9-2.4-.6-4.5.5" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function TvIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="m8 3 4 4 4-4" />
    </Svg>
  );
}

export function FilmIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M7 12h10" />
    </Svg>
  );
}
