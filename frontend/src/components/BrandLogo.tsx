import logoDark from '../assets/brand/catrion-logo-dark.svg';
import logoLight from '../assets/brand/catrion-logo-light.svg';
import logoBlack from '../assets/brand/catrion-logo-black.svg';
import logoWhite from '../assets/brand/catrion-logo-white.svg';

type BrandLogoProps = {
  variant?: 'dark' | 'light' | 'black' | 'white';
  decorative?: boolean;
  className?: string;
};

const logos = { dark: logoDark, light: logoLight, black: logoBlack, white: logoWhite };

export function BrandLogo({ variant = 'dark', decorative = false, className = '' }: BrandLogoProps) {
  return (
    <img
      src={logos[variant]}
      alt={decorative ? '' : 'Catrion'}
      aria-hidden={decorative ? true : undefined}
      width="800"
      height="176"
      className={className}
    />
  );
}
