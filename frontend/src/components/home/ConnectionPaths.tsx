import { useEffect, useRef, type CSSProperties } from 'react';

type Variant = 'hero' | 'capabilities' | 'final';
type Orientation = 'horizontal' | 'vertical';
type Direction = 'forward' | 'reverse';

type Beam = {
  x: number;
  y: number;
  length: number;
  orientation: Orientation;
  direction: Direction;
  cycle: number;
  delay: number;
};

type ConnectionPathsProps = {
  variant: Variant;
};

const beams: Record<Variant, Beam[]> = {
  hero: [
    // Grupo A: quatro feixes quase simultâneos.
    { x: 8, y: 14, length: 210, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: 0 },
    { x: 84, y: 72, length: 115, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: 0.01 },
    { x: 53, y: 10, length: 165, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: 0.02 },
    { x: 7, y: 50, length: 120, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: 0.03 },
    // Grupo B: inicia 0,5 s depois do grupo A.
    { x: 15, y: 83, length: 175, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -1 },
    { x: 93, y: 31, length: 130, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.99 },
    { x: 30, y: 28, length: 150, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.98 },
    { x: 72, y: 91, length: 145, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.97 },
    // Grupo C: inicia 0,5 s depois do grupo B.
    { x: 22, y: 64, length: 115, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -0.5 },
    { x: 65, y: 43, length: 175, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -0.49 },
    { x: 89, y: 58, length: 125, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.48 },
    { x: 11, y: 32, length: 165, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.47 }
  ],
  capabilities: [
    // Grupo A.
    { x: 9, y: 15, length: 170, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.13 },
    { x: 87, y: 21, length: 130, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.12 },
    { x: 62, y: 81, length: 165, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -0.11 },
    { x: 18, y: 73, length: 110, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -0.1 },
    // Grupo B.
    { x: 39, y: 11, length: 150, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -1.13 },
    { x: 94, y: 58, length: 100, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -1.12 },
    { x: 12, y: 43, length: 145, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -1.11 },
    { x: 76, y: 13, length: 115, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -1.1 },
    // Grupo C.
    { x: 31, y: 91, length: 165, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.63 },
    { x: 55, y: 55, length: 150, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -0.62 },
    { x: 91, y: 67, length: 120, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.61 },
    { x: 15, y: 27, length: 120, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -0.6 }
  ],
  final: [
    // Grupo A.
    { x: 11, y: 16, length: 195, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.26 },
    { x: 82, y: 23, length: 125, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.25 },
    { x: 14, y: 83, length: 170, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -0.24 },
    { x: 91, y: 73, length: 115, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -0.23 },
    // Grupo B.
    { x: 44, y: 10, length: 165, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -1.26 },
    { x: 7, y: 42, length: 120, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -1.25 },
    { x: 71, y: 91, length: 155, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -1.24 },
    { x: 32, y: 28, length: 140, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -1.23 },
    // Grupo C.
    { x: 64, y: 59, length: 125, orientation: 'vertical', direction: 'reverse', cycle: 1.5, delay: -0.76 },
    { x: 24, y: 66, length: 160, orientation: 'horizontal', direction: 'reverse', cycle: 1.5, delay: -0.75 },
    { x: 90, y: 37, length: 125, orientation: 'vertical', direction: 'forward', cycle: 1.5, delay: -0.74 },
    { x: 18, y: 90, length: 170, orientation: 'horizontal', direction: 'forward', cycle: 1.5, delay: -0.73 }
  ]
};

export function ConnectionPaths({ variant }: ConnectionPathsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;

    let visible = false;

    const updateActivity = () => {
      layer.dataset.active = visible && !document.hidden ? 'true' : 'false';
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updateActivity();
      },
      { threshold: 0.08 }
    );

    observer.observe(layer);
    document.addEventListener('visibilitychange', updateActivity);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateActivity);
    };
  }, [variant]);

  return (
    <div
      ref={ref}
      className={`connection-paths connection-paths--${variant}`}
      data-active="false"
      aria-hidden="true"
    >
      {beams[variant].map((beam, index) => {
        const style = {
          left: `${beam.x}%`,
          top: `${beam.y}%`,
          ['--beam-length' as string]: `${beam.length}px`,
          ['--beam-cycle' as string]: `${beam.cycle}s`,
          ['--beam-delay' as string]: `${beam.delay}s`
        } as CSSProperties;

        return (
          <span
            key={`${variant}-${index}`}
            className={[
              'connection-paths__beam',
              `connection-paths__beam--${beam.orientation}`,
              `connection-paths__beam--${beam.direction}`
            ].join(' ')}
            style={style}
          />
        );
      })}
    </div>
  );
}
