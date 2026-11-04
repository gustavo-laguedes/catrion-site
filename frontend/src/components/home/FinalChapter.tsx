import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { BrandSlash } from '../BrandSlash';
import { ConnectionPaths } from './ConnectionPaths';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function FinalChapter() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    const section = ref.current;
    const slash = section?.querySelector<HTMLElement>('[data-return-slash]');
    const stage = section?.querySelector<HTMLElement>('.final-stage');
    const cta = section?.querySelector<HTMLElement>('.final-cta');
    const returnBlock = section?.querySelector<HTMLElement>('.final-return');
    if (!section || !slash || !stage || !cta || !returnBlock) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let travelY = 0;
      const measure = () => {
        travelY = Math.max(0, returnBlock.offsetTop - slash.offsetTop - slash.offsetHeight - 24);
      };
      const render = (progress: number) => {
        const fade = (start: number, end: number) => Math.max(0, Math.min(1, (progress - start) / (end - start)));
        cta.style.opacity = String(1 - fade(0.32, 0.57));
        // Keep the link interactive until the CTA is completely invisible.
        cta.style.visibility = progress < 0.57 ? 'visible' : 'hidden';
        cta.inert = progress >= 0.57;
        returnBlock.style.opacity = String(fade(0.49, 0.74));
        const p = Math.max(0, Math.min(1, (progress - 0.57) / 0.33));
        const eased = p * p * (3 - 2 * p);
        // Approach the closing statement only after the CTA has faded out.
        slash.style.transform = `translate3d(${-18 * eased}px, ${travelY * eased}px, 0) rotate(${4 * eased}deg)`;
      };
      const trigger = ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom bottom', onUpdate: self => render(self.progress), onRefresh: self => { measure(); render(self.progress); } });
      measure();
      render(trigger.progress);
      return () => {
        trigger.kill();
        cta.style.removeProperty('opacity');
        cta.style.removeProperty('visibility');
        cta.inert = false;
        returnBlock.style.removeProperty('opacity');
        slash.style.removeProperty('transform');
      };
    });
    return () => media.revert();
  }, { scope: ref });

  return <section ref={ref} className="final-chapter" aria-labelledby="final-title">
    <div className="final-stage"><ConnectionPaths variant="final" /><div className="final-cta"><p className="chapter-index">05 / Vamos conversar</p><p className="final-prompt">Tem uma ideia?</p><h2 id="final-title">Vamos construir<br /><em>algo grande.</em></h2><Link to="/contato" className="final-link">Conversar sobre um projeto <span aria-hidden="true">↗</span></Link></div>
      <div className="final-return">
        <p className="final-return__eyebrow">Sites, sistemas e aplicativos são partes de algo maior.</p>
        <h3 className="final-return__statement">Criamos<br /><em>ecossistemas digitais.</em></h3>
      </div>
      <div className="final-moving-slash" data-return-slash aria-hidden="true"><BrandSlash /></div>
    </div>
  </section>;
}
