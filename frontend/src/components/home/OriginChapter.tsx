import { useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AnimatedBrandMark } from '../hero/AnimatedBrandMark';
import { ConnectionPaths } from './ConnectionPaths';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const INTRO_SESSION_KEY = 'catrion:hero-intro-seen';

type OriginChapterProps = {
  chapterRef: RefObject<HTMLElement | null>;
};

export function OriginChapter({ chapterRef }: OriginChapterProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const chapter = chapterRef.current;
    const scene = sceneRef.current;
    if (!chapter || !scene) return;

    const brand = scene.querySelector<HTMLElement>('[data-animated-brand-mark]');
    const frame = scene.querySelector<SVGGElement>('#frame');
    const wordmark = scene.querySelector<SVGGElement>('#wordmark');
    const accent = scene.querySelector<SVGGElement>('#accent');
    const statement = scene.querySelector<HTMLElement>('[data-origin-statement]');
    const statementLines = gsap.utils.toArray<HTMLElement>('[data-origin-line]', scene);
    const supporting = scene.querySelector<HTMLElement>('[data-origin-support]');
    if (!brand || !frame || !wordmark || !accent || !statement || !supporting) return;

    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      let introSeen = false;
      try {
        introSeen = window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true';
      } catch {
        // Storage is an enhancement; the full intro remains the fallback.
      }

      gsap.set(accent, { transformBox: 'fill-box', transformOrigin: '50% 50%' });

      const intro = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          try {
            window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
          } catch {
            // Ignore unavailable storage.
          }
        }
      });

      if (introSeen) {
        intro
          .fromTo(brand, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.48 })
          .fromTo(statementLines, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, 0.08)
          .fromTo(supporting, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.42 }, 0.24);
      } else {
        intro
          .fromTo(accent, { autoAlpha: 0, scale: 0.52 }, { autoAlpha: 1, scale: 1, duration: 0.42 }, 0.05)
          .fromTo(frame, { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.72 }, 0.28)
          .fromTo(wordmark, { autoAlpha: 0, x: -10, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.64 }, 0.78)
          .fromTo(statementLines, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.08 }, 1.03)
          .fromTo(supporting, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.48 }, 1.42);
      }

      const settleIntroOnEarlyScroll = () => {
        if (window.scrollY > 4 && intro.isActive()) intro.progress(1).kill();
      };
      window.addEventListener('scroll', settleIntroOnEarlyScroll, { passive: true });

      const scrollTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: chapter,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          invalidateOnRefresh: true
        }
      });

      scrollTimeline
        .to(brand, { scale: 0.92, yPercent: -5, opacity: 0.82, duration: 0.42, ease: 'power2.inOut' }, 0.08)
        .to(statement, { yPercent: -8, duration: 0.46, ease: 'power2.inOut' }, 0.12)
        .to(supporting, { autoAlpha: 0.28, y: -10, duration: 0.28 }, 0.42)
        .to(statement, { scale: 0.965, transformOrigin: 'left center', duration: 0.3 }, 0.58)
        .to([brand, statement], { opacity: 0.52, duration: 0.18 }, 0.82);

      return () => {
        window.removeEventListener('scroll', settleIntroOnEarlyScroll);
        intro.kill();
      };
    });

    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set([brand, frame, wordmark, accent, statement, statementLines, supporting], { clearProps: 'all' });
    });

    return () => media.revert();
  }, { scope: sceneRef, dependencies: [chapterRef] });

  return (
    <section ref={chapterRef} className="origin-chapter" aria-labelledby="origin-title">
      <div ref={sceneRef} className="origin-chapter__stage">
        <ConnectionPaths variant="hero" />
        <div className="origin-chapter__brand-wrap">
          <AnimatedBrandMark className="origin-chapter__brand" />
        </div>

        <h1 id="origin-title" className="origin-statement" data-origin-statement>
          <span data-origin-line>Everything we do,</span>
          <span data-origin-line>
            we do it big<span className="origin-statement__dot">.</span>
          </span>
        </h1>

        <div className="origin-support" data-origin-support>
          <p>Sites. Sistemas. Aplicativos.</p>
          <span>Criamos ecossistemas digitais que conectam ideias, pessoas e operações.</span>
        </div>
      </div>
    </section>
  );
}
