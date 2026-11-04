import { useEffect, useRef, type RefObject } from 'react';
import { BrandSlash } from '../BrandSlash';

export function AboutChapter({ chapterRef }: { chapterRef: RefObject<HTMLElement | null> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chapter = chapterRef.current;
    const stage = stageRef.current;
    const title = stage?.querySelector<HTMLElement>('[data-about-title]');
    const rule = stage?.querySelector<HTMLElement>('[data-about-rule]');
    const copy = stage?.querySelector<HTMLElement>('[data-about-copy]');
    if (!chapter || !title || !rule || !copy) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const render = () => {
      frame = 0;
      const top = chapter.getBoundingClientRect().top;
      const p = Math.max(0, Math.min(1, (window.innerHeight - top) / window.innerHeight));
      const ease = p * p * (3 - 2 * p);
      title.style.clipPath = `inset(0 ${100 * (1 - ease)}% 0 0)`;
      title.style.transform = `translateX(${-35 * (1 - ease)}px)`;
      rule.style.transform = `scaleX(${ease})`;
      copy.style.clipPath = `inset(0 0 ${100 * (1 - ease)}% 0)`;
      copy.style.transform = `translateY(${35 * (1 - ease)}px)`;
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(render); };
    render();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); window.cancelAnimationFrame(frame); };
  }, [chapterRef]);

  return <section ref={chapterRef} id="sobre" className="about-chapter" aria-labelledby="about-title">
    <div ref={stageRef} className="about-stage">
      <div className="about-slash" data-about-slash aria-hidden="true"><BrandSlash /></div>
      <p className="chapter-index">01 / Sobre a Catrion</p>
      <h2 id="about-title" data-about-title>Tecnologia e Criação,<br /><em>do conceito ao produto.</em></h2>
      <div className="about-rule" data-about-rule />
      <div className="about-copy" data-about-copy>
        <p>A Catrion é uma empresa de Tecnologia e Criação. Construímos ecossistemas digitais que conectam estratégia, design e tecnologia para transformar ideias em produtos, experiências e operações que evoluem com cada negócio.</p>
        <p>Não começamos por soluções prontas. Entendemos pessoas, processos e objetivos para desenvolver sites, sistemas e aplicativos sob medida, com identidade, propósito e integração quando o projeto precisa.</p>
      </div>
    </div>
  </section>;
}
