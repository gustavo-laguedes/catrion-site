import type { SVGProps } from 'react';

type BrandSlashProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  decorative?: boolean;
};

// Exact accent path from catrion-logo-dark.svg, isolated in its original coordinate space.
export function BrandSlash({ decorative = true, className = '', ...props }: BrandSlashProps) {
  return (
    <svg
      viewBox="739 112 61 64"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-slash ${className}`}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Diagonal amarela Catrion'}
      {...props}
    >
      <path d="M800 112V142L766 176H739Z" />
    </svg>
  );
}
