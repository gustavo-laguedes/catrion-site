import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  width?: 'default' | 'wide' | 'bleed';
};

export function Container({ children, className = '', width = 'default' }: ContainerProps) {
  const widthClass = width === 'default' ? '' : ` site-container--${width}`;
  return <div className={`site-container${widthClass} ${className}`}>{children}</div>;
}
