import { useEffect, useRef, type RefObject } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import { BrandSlash } from '../BrandSlash';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  rootRef: RefObject<HTMLDivElement | null>;
  originRef: RefObject<HTMLElement | null>;
  aboutRef: RefObject<HTMLElement | null>;
};

// One owner is selected from scroll progress on every update, in either direction.
export function SharedSlashLayer({ rootRef, originRef, aboutRef }: Props) {
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const origin = originRef.current;
    const about = aboutRef.current;
    const mark = markRef.current;
    const source = origin?.querySelector<SVGGElement>('#accent');
    const destination = about?.querySelector<HTMLElement>('[data-about-slash]');
    if (!root || !origin || !about || !mark || !source || !destination) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let from = { x: 0, y: 0, width: 1, height: 1 };
      let to = { x: 0, y: 0, width: 1, height: 1 };
      let trigger: ScrollTrigger;

      const measure = (start: number) => {
        const sourceBounds = source.getBoundingClientRect();
        const destBounds = destination.getBoundingClientRect();
        // The source leaves its sticky stage after the trigger starts. Reconstruct
        // its position at the start so a refresh halfway through is deterministic.
        const passed = Math.max(0, window.scrollY - start);
        from = { x: sourceBounds.x, y: sourceBounds.y + passed, width: sourceBounds.width, height: sourceBounds.height };
        to = { x: destBounds.x, y: destBounds.y, width: destBounds.width, height: destBounds.height };
      };

      const render = (progress: number) => {
        const p = Math.max(0, Math.min(1, progress));
        root.dataset.slashOwner = p <= 0 ? 'origin' : p >= 1 ? 'about' : 'shared';
        if (p <= 0 || p >= 1) return;
        const destinationBounds = destination.getBoundingClientRect();
        to = { x: destinationBounds.x, y: destinationBounds.y, width: destinationBounds.width, height: destinationBounds.height };
        const ease = p * p * (3 - 2 * p);
        const lerp = (a: number, b: number) => a + (b - a) * ease;
        mark.style.left = `${lerp(from.x, to.x)}px`;
        mark.style.top = `${lerp(from.y, to.y)}px`;
        mark.style.width = `${lerp(from.width, to.width)}px`;
        mark.style.height = `${lerp(from.height, to.height)}px`;
      };

      trigger = ScrollTrigger.create({
        trigger: about,
        start: 'top 100%',
        end: 'top top',
        invalidateOnRefresh: true,
        onRefresh: (self) => { measure(self.start); render(self.progress); },
        onUpdate: (self) => render(self.progress)
      });
      measure(trigger.start);
      render(trigger.progress);
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(origin);
      observer.observe(about);
      return () => {
        observer.disconnect();
        trigger.kill();
        delete root.dataset.slashOwner;
      };
    });
    media.add('(prefers-reduced-motion: reduce)', () => {
      root.dataset.slashOwner = 'static';
      return () => { delete root.dataset.slashOwner; };
    });
    return () => media.revert();
  }, [rootRef, originRef, aboutRef]);

  return <div ref={markRef} className="shared-slash-mark" aria-hidden="true"><BrandSlash /></div>;
}
