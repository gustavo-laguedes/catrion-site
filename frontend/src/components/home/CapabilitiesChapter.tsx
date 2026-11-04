import { useEffect, useRef, type RefObject } from 'react';
import { BrandSlash } from '../BrandSlash';
import { ConnectionPaths } from './ConnectionPaths';

const capabilities = [
  {
    title: 'Sites',
    lead: 'Sites que não parecem modelos prontos.',
    body: 'Experiências digitais feitas para comunicar com identidade, criar conexões e transformar presença em valor.'
  },
  {
    title: 'Sistemas',
    lead: 'Tecnologia construída em torno da operação.',
    body: 'Sistemas sob medida que organizam processos, conectam informações e dão clareza às decisões.'
  },
  {
    title: 'Aplicativos',
    lead: 'Produtos digitais pensados para acompanhar pessoas.',
    body: 'Aplicativos que aproximam pessoas e negócios, com experiência, desempenho e propósito.'
  }
];

const ROTATION_MS = 3600;
const SWITCH_LEAD_MS = 120;
const SWITCH_SETTLE_MS = 460;

export function CapabilitiesChapter({ chapterRef }: { chapterRef: RefObject<HTMLElement | null> }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chapter = chapterRef.current;
    const stage = stageRef.current;
    if (!chapter || !stage) return;

    const states = Array.from(stage.querySelectorAll<HTMLElement>('[data-capability-state]'));
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    let active = 0;
    let visible = false;
    let intervalId: number | undefined;
    let leadTimerId: number | undefined;
    let settleTimerId: number | undefined;

    const syncAria = (index: number) => {
      states.forEach((state, stateIndex) => {
        const isVisible = stateIndex === index;
        state.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      });
    };

    const clearTimers = () => {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (leadTimerId !== undefined) window.clearTimeout(leadTimerId);
      if (settleTimerId !== undefined) window.clearTimeout(settleTimerId);
      intervalId = undefined;
      leadTimerId = undefined;
      settleTimerId = undefined;
    };

    const render = (index: number) => {
      active = index;
      stage.dataset.active = String(index);
      syncAria(index);
    };

    const triggerSwap = (nextIndex: number) => {
      if (motionPreference.matches) {
        render(nextIndex);
        stage.dataset.switching = 'false';
        return;
      }

      if (leadTimerId !== undefined || settleTimerId !== undefined) return;

      stage.dataset.switching = 'true';

      leadTimerId = window.setTimeout(() => {
        render(nextIndex);
        leadTimerId = undefined;
      }, SWITCH_LEAD_MS);

      settleTimerId = window.setTimeout(() => {
        stage.dataset.switching = 'false';
        settleTimerId = undefined;
      }, SWITCH_SETTLE_MS);
    };

    const updateMode = () => {
      clearTimers();

      if (motionPreference.matches) {
        stage.dataset.reduced = 'true';
        stage.dataset.switching = 'false';
        stage.dataset.active = 'all';
        states.forEach(state => state.setAttribute('aria-hidden', 'false'));
        return;
      }

      stage.dataset.reduced = 'false';
      stage.dataset.switching = 'false';
      render(active);

      if (visible && !document.hidden) {
        intervalId = window.setInterval(() => {
          triggerSwap((active + 1) % capabilities.length);
        }, ROTATION_MS);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updateMode();
      },
      { threshold: 0.4 }
    );

    observer.observe(chapter);
    document.addEventListener('visibilitychange', updateMode);
    motionPreference.addEventListener('change', updateMode);
    updateMode();

    return () => {
      clearTimers();
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateMode);
      motionPreference.removeEventListener('change', updateMode);
    };
  }, [chapterRef]);

  return (
    <section ref={chapterRef} id="o-que-fazemos" className="capabilities-chapter" aria-labelledby="capabilities-title">
      <div ref={stageRef} className="capabilities-stage" data-active="0" data-switching="false" data-reduced="false">
        <p className="chapter-index">02 / O que fazemos</p>
        <h2 id="capabilities-title" className="sr-only">Sites, sistemas e aplicativos</h2>

        <div className="capability-composition" aria-hidden="true">
          <div className="composition-aura" />
          <div className="composition-frame">
            <BrandSlash />
          </div>
          <ConnectionPaths variant="capabilities" />
        </div>

        {capabilities.map((item, index) => (
          <div
            className="capability-state"
            data-capability-state
            data-capability-index={index}
            key={item.title}
            aria-hidden={index === 0 ? 'false' : 'true'}
          >
            <span className="capability-number">0{index + 1} / 03</span>
            <div className="capability-title-shell">
              <span className="capability-title-bolt" aria-hidden="true" />
              <h3>{item.title}</h3>
            </div>
            <div className="capability-description">
              <strong>{item.lead}</strong>
              <p>{item.body}</p>
            </div>
          </div>
        ))}

        <div className="capability-progress" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
