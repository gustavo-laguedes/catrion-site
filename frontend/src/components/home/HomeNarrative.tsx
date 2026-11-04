import { useEffect, useRef } from 'react';
import type { HeaderTheme } from '../Header';
import { OriginChapter } from './OriginChapter';
import { AboutChapter } from './AboutChapter';
import { CapabilitiesChapter } from './CapabilitiesChapter';
import { ProcessChapter } from './ProcessChapter';
import { PartnersChapter } from './PartnersChapter';
import { FinalChapter } from './FinalChapter';
import { SharedSlashLayer } from './SharedSlashLayer';
import './home-narrative.css';

export function HomeNarrative({ setHeaderTheme }: { setHeaderTheme: (theme: HeaderTheme) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const capabilitiesRef = useRef<HTMLElement>(null);
  useEffect(() => {
    let current: HeaderTheme = 'dark';
    let raf = 0;
    const update = () => {
      raf = 0;
      const atHeader = (selector: string) => (document.querySelector(selector)?.getBoundingClientRect().top ?? Infinity) <= 72;
      const next: HeaderTheme = atHeader('.final-chapter') ? 'dark' : atHeader('.process-chapter') ? 'light' : atHeader('.capabilities-chapter') ? 'dark' : atHeader('.about-chapter') ? 'light' : 'dark';
      if (next !== current) { current = next; setHeaderTheme(next); }
    };
    const schedule = () => { if (!raf) raf = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.cancelAnimationFrame(raf); setHeaderTheme('dark'); };
  }, [setHeaderTheme]);
  return <div ref={rootRef} className="home-narrative" data-slash-owner="origin">
    <OriginChapter chapterRef={originRef} />
    <AboutChapter chapterRef={aboutRef} />
    <CapabilitiesChapter chapterRef={capabilitiesRef} />
    <ProcessChapter />
    <PartnersChapter />
    <FinalChapter />
    <SharedSlashLayer rootRef={rootRef} originRef={originRef} aboutRef={aboutRef} />
  </div>;
}
