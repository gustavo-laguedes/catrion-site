import officialBrandMarkup from '../../assets/brand/catrion-logo-dark.svg?raw';

type AnimatedBrandMarkProps = {
  className?: string;
};

/**
 * The trusted markup comes directly from the official master asset so GSAP can
 * address frame, wordmark and accent without duplicating any brand geometry.
 */
export function AnimatedBrandMark({ className = '' }: AnimatedBrandMarkProps) {
  return (
    <div
      className={`hero-brand-mark ${className}`}
      data-animated-brand-mark
      dangerouslySetInnerHTML={{ __html: officialBrandMarkup }}
    />
  );
}
