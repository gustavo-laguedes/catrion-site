import type { ReactNode } from 'react';

type SectionEyebrowProps = { children: ReactNode; className?: string };

export function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return <p className={`type-micro text-accent ${className}`}>{children}</p>;
}
