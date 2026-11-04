import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BrandSlash } from '../BrandSlash';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  { title: 'Entender', copy: 'Entendemos o negócio, o problema e o objetivo.' },
  { title: 'Projetar', copy: 'Transformamos estratégia em arquitetura, experiência e direção.' },
  { title: 'Construir', copy: 'Desenvolvemos com engenharia, performance e atenção aos detalhes.' },
  { title: 'Evoluir', copy: 'Testamos, refinamos e continuamos melhorando o produto.' }
];

export function ProcessChapter() {
  const ref = useRef<HTMLElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const section = ref.current;
    const slash = marker.current;
    if (!section || !slash) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({ trigger: section, start: 'top 50%', end: 'bottom 60%', onUpdate: self => { slash.style.top = `${self.progress * 100}%`; } });
      return () => trigger.kill();
    });
    return () => media.revert();
  }, { scope: ref });
  return <section ref={ref} id="como-trabalhamos" className="process-chapter" aria-labelledby="process-title">
    <div className="process-heading"><p className="chapter-index">03 / Como trabalhamos</p><h2 id="process-title">Da ideia à<br /><em>evolução.</em></h2><p>Cada decisão começa pelo que o projeto precisa e continua depois de ir ao ar.</p></div>
    <div className="process-steps"><div className="process-track" aria-hidden="true"><div ref={marker} className="process-marker"><BrandSlash /></div></div>{steps.map((step, index) => <article key={step.title}><span>0{index + 1}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}</div>
  </section>;
}
