import { useEffect, useRef } from 'react';

type SiteCursorProps = {
  reducedMotion: boolean;
};

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'select',
  'textarea',
  'summary',
  '.hero__name',
].join(', ');

const PANEL_SELECTOR = [
  '.timeline-card',
  '.research-card',
  '.project-card',
  '.info-card',
  '.meta-band__block',
].join(', ');

export default function SiteCursor({ reducedMotion }: SiteCursorProps) {
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const cursor = cursorRef.current;
    const media = window.matchMedia('(pointer: fine) and (hover: hover)');

    if (!cursor || !media.matches) {
      return;
    }

    let frameId: number | null = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    document.body.classList.add('has-custom-cursor');

    const applyInteractiveState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const interactiveElement = element?.closest(INTERACTIVE_SELECTOR) ?? null;
      const panelElement = element?.closest(PANEL_SELECTOR) ?? null;

      cursor.classList.toggle(
        'is-engaged',
        Boolean(interactiveElement || panelElement),
      );
      cursor.classList.toggle('is-panel', Boolean(panelElement));
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.26;
      currentY += (targetY - currentY) * 0.26;

      cursor.style.setProperty('--site-cursor-x', `${currentX}px`);
      cursor.style.setProperty('--site-cursor-y', `${currentY}px`);

      if (
        Math.abs(targetX - currentX) > 0.15 ||
        Math.abs(targetY - currentY) > 0.15
      ) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      frameId = null;
    };

    const scheduleRender = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    const showCursor = () => {
      cursor.classList.add('is-visible');
    };

    const hideCursor = () => {
      cursor.classList.remove(
        'is-visible',
        'is-engaged',
        'is-panel',
        'is-pressed',
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      showCursor();
      applyInteractiveState(document.elementFromPoint(event.clientX, event.clientY));
      scheduleRender();
    };

    const handlePointerDown = () => {
      cursor.classList.add('is-pressed');
    };

    const handlePointerUp = () => {
      cursor.classList.remove('is-pressed');
    };

    const handleWindowBlur = () => {
      hideCursor();
    };

    const handleDocumentMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        hideCursor();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('mouseout', handleDocumentMouseOut);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('mouseout', handleDocumentMouseOut);
    };
  }, [reducedMotion]);

  return (
    <div ref={cursorRef} className="site-cursor" aria-hidden="true">
      <span className="site-cursor__outer-ring" />
      <span className="site-cursor__orbit">
        <span className="site-cursor__orbit-line site-cursor__orbit-line--1" />
        <span className="site-cursor__orbit-line site-cursor__orbit-line--2" />
        <span className="site-cursor__orbit-line site-cursor__orbit-line--3" />
        <span className="site-cursor__orbit-line site-cursor__orbit-line--4" />
        <span className="site-cursor__orbit-line site-cursor__orbit-line--5" />
      </span>
      <span className="site-cursor__core" />
    </div>
  );
}
