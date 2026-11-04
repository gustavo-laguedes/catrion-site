import type { ReactNode } from 'react';
import { Container } from './Container';

type SectionProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  width?: 'default' | 'wide' | 'bleed';
  label?: string;
};

export function Section({ children, className = '', contentClassName = '', width = 'default', label }: SectionProps) {
  return (
    <section className={`site-section ${className}`} aria-label={label}>
      <Container width={width} className={contentClassName}>{children}</Container>
    </section>
  );
}
