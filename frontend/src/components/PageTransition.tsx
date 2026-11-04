import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { BrandSlash } from './BrandSlash';

type Phase = 'idle' | 'cover' | 'reveal';
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const previousPath = useRef(location.pathname);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    !reduce() && currentLocation.pathname !== nextLocation.pathname
  );
  const delay = (callback: () => void, ms: number) => { timers.current.push(window.setTimeout(callback, ms)); };

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  useEffect(() => {
    if (blocker.state !== 'blocked' || busy.current) return;
    busy.current = true;
    setPhase('cover');
    delay(() => blocker.proceed(), 330);
  }, [blocker]);
  useEffect(() => {
    const changed = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    if (!changed) return;
    if (location.hash) {
      window.requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
    } else {
      window.scrollTo(0, 0);
    }
    if (busy.current) {
      setPhase('reveal');
      delay(() => { setPhase('idle'); busy.current = false; }, 360);
    }
  }, [location.pathname, location.hash]);

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    if (!busy.current) navigate(`${url.pathname}${url.search}${url.hash}`);
  };

  return <div onClickCapture={onClickCapture}>
    {children}
    <div className={`page-transition page-transition--${phase}`} aria-hidden="true">
      <div className="page-transition__surface" />
      <div className="page-transition__charge" />
      <div className="page-transition__slash">
        <BrandSlash />
      </div>
    </div>
  </div>;
}
